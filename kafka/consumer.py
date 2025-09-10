import os
import json
import logging
import time
from datetime import datetime
from typing import Dict, List
import pandas as pd
import numpy as np
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from dotenv import load_dotenv
import requests
import redis

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ChurnEventConsumer:
    """Kafka consumer for processing customer events and generating churn predictions"""
    
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BROKER', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'churn-consumer-group')
        self.api_url = os.getenv('API_URL', 'http://localhost:5000')
        
        # Initialize Redis for caching customer data
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD', ''),
            decode_responses=True
        )
        
        # Initialize Kafka consumer
        self.consumer = KafkaConsumer(
            self.topic,
            bootstrap_servers=[self.bootstrap_servers],
            group_id=self.group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            auto_offset_reset='latest',
            enable_auto_commit=True,
            auto_commit_interval_ms=1000,
            session_timeout_ms=30000,
            heartbeat_interval_ms=10000
        )
        
        logger.info(f"Consumer initialized for topic: {self.topic}")
    
    def process_event(self, event: Dict):
        """Process a customer event and update customer profile"""
        try:
            customer_id = event['customer_id']
            event_type = event['event_type']
            event_data = event['data']
            timestamp = event['timestamp']
            
            logger.info(f"Processing {event_type} event for customer {customer_id}")
            
            # Update customer profile in Redis
            self._update_customer_profile(customer_id, event_type, event_data, timestamp)
            
            # Check if we should trigger churn prediction
            if self._should_predict_churn(event_type, event_data):
                self._trigger_churn_prediction(customer_id)
            
            # Check for immediate alerts
            self._check_immediate_alerts(customer_id, event_type, event_data)
            
        except Exception as e:
            logger.error(f"Error processing event: {e}")
    
    def _update_customer_profile(self, customer_id: str, event_type: str, event_data: Dict, timestamp: str):
        """Update customer profile in Redis based on event"""
        try:
            # Get existing customer profile
            profile_key = f"customer_profile:{customer_id}"
            profile = self.redis_client.hgetall(profile_key)
            
            if not profile:
                # Initialize new customer profile
                profile = {
                    'customer_id': customer_id,
                    'total_orders': '0',
                    'total_spent': '0.0',
                    'avg_order_value': '0.0',
                    'days_since_last_order': '0',
                    'support_tickets': '0',
                    'product_returns': '0',
                    'email_engagement': '0.0',
                    'login_frequency': '0',
                    'payment_failures': '0',
                    'discount_usage': '0.0',
                    'loyalty_points': '0',
                    'account_age_days': '0',
                    'last_activity': timestamp,
                    'created_at': timestamp
                }
            
            # Update profile based on event type
            if event_type == 'order_placed':
                profile['total_orders'] = str(int(profile.get('total_orders', 0)) + 1)
                order_value = float(event_data.get('order_value', 0))
                profile['total_spent'] = str(float(profile.get('total_spent', 0)) + order_value)
                
                # Update average order value
                total_orders = int(profile['total_orders'])
                total_spent = float(profile['total_spent'])
                profile['avg_order_value'] = str(total_spent / total_orders)
                
                profile['days_since_last_order'] = '0'
                profile['last_activity'] = timestamp
            
            elif event_type == 'payment_failed':
                profile['payment_failures'] = str(int(profile.get('payment_failures', 0)) + 1)
            
            elif event_type == 'support_ticket_created':
                profile['support_tickets'] = str(int(profile.get('support_tickets', 0)) + 1)
            
            elif event_type == 'email_opened':
                # Update email engagement score
                current_engagement = float(profile.get('email_engagement', 0))
                profile['email_engagement'] = str(min(1.0, current_engagement + 0.1))
            
            elif event_type == 'login':
                profile['login_frequency'] = str(int(profile.get('login_frequency', 0)) + 1)
                profile['last_activity'] = timestamp
            
            elif event_type == 'refund_requested':
                profile['product_returns'] = str(int(profile.get('product_returns', 0)) + 1)
            
            # Update last activity
            profile['last_activity'] = timestamp
            
            # Save updated profile to Redis
            self.redis_client.hset(profile_key, mapping=profile)
            
            # Set expiration (30 days)
            self.redis_client.expire(profile_key, 30 * 24 * 60 * 60)
            
            logger.info(f"Updated profile for customer {customer_id}")
            
        except Exception as e:
            logger.error(f"Error updating customer profile: {e}")
    
    def _should_predict_churn(self, event_type: str, event_data: Dict) -> bool:
        """Determine if we should trigger churn prediction based on event"""
        # Trigger prediction for significant events
        significant_events = [
            'order_placed',
            'payment_failed',
            'support_ticket_created',
            'subscription_cancelled',
            'cart_abandoned'
        ]
        
        return event_type in significant_events
    
    def _trigger_churn_prediction(self, customer_id: str):
        """Trigger churn prediction for a customer"""
        try:
            # Get customer profile from Redis
            profile_key = f"customer_profile:{customer_id}"
            profile = self.redis_client.hgetall(profile_key)
            
            if not profile:
                logger.warning(f"No profile found for customer {customer_id}")
                return
            
            # Prepare customer data for prediction
            customer_data = {
                'total_orders': int(profile.get('total_orders', 0)),
                'total_spent': float(profile.get('total_spent', 0)),
                'avg_order_value': float(profile.get('avg_order_value', 0)),
                'days_since_last_order': int(profile.get('days_since_last_order', 0)),
                'support_tickets': int(profile.get('support_tickets', 0)),
                'product_returns': int(profile.get('product_returns', 0)),
                'email_engagement': float(profile.get('email_engagement', 0)),
                'login_frequency': int(profile.get('login_frequency', 0)),
                'payment_failures': int(profile.get('payment_failures', 0)),
                'discount_usage': float(profile.get('discount_usage', 0)),
                'loyalty_points': int(profile.get('loyalty_points', 0)),
                'account_age_days': int(profile.get('account_age_days', 0))
            }
            
            # Call prediction API
            response = requests.post(
                f"{self.api_url}/api/churn/predict",
                json=customer_data,
                timeout=10
            )
            
            if response.status_code == 200:
                prediction = response.json()
                
                # Store prediction in Redis
                prediction_key = f"churn_prediction:{customer_id}"
                prediction_data = {
                    'customer_id': customer_id,
                    'churn_probability': prediction['churn_probability'],
                    'risk_level': prediction['risk_level'],
                    'recommendations': json.dumps(prediction['recommendations']),
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                self.redis_client.hset(prediction_key, mapping=prediction_data)
                self.redis_client.expire(prediction_key, 7 * 24 * 60 * 60)  # 7 days
                
                logger.info(f"Churn prediction for {customer_id}: {prediction['risk_level']} risk ({prediction['churn_probability']:.2f})")
                
            else:
                logger.error(f"Prediction API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error triggering churn prediction: {e}")
    
    def _check_immediate_alerts(self, customer_id: str, event_type: str, event_data: Dict):
        """Check for events that require immediate alerts"""
        try:
            # High-priority events that need immediate attention
            critical_events = {
                'payment_failed': 'Payment failure detected',
                'support_ticket_created': 'New support ticket created',
                'subscription_cancelled': 'Subscription cancelled',
                'refund_requested': 'Refund requested'
            }
            
            if event_type in critical_events:
                # Create alert
                alert = {
                    'customer_id': customer_id,
                    'event_type': event_type,
                    'message': critical_events[event_type],
                    'timestamp': datetime.utcnow().isoformat(),
                    'priority': 'high' if event_type in ['subscription_cancelled', 'payment_failed'] else 'medium'
                }
                
                # Store alert in Redis
                alert_key = f"alert:{customer_id}:{int(time.time())}"
                self.redis_client.hset(alert_key, mapping=alert)
                self.redis_client.expire(alert_key, 24 * 60 * 60)  # 24 hours
                
                logger.warning(f"ALERT: {alert['message']} for customer {customer_id}")
                
        except Exception as e:
            logger.error(f"Error checking immediate alerts: {e}")
    
    def start_consuming(self):
        """Start consuming events from Kafka"""
        try:
            logger.info("Starting to consume customer events...")
            
            for message in self.consumer:
                try:
                    event = message.value
                    self.process_event(event)
                    
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    continue
                    
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            self.consumer.close()
    
    def close(self):
        """Close the consumer and Redis connection"""
        self.consumer.close()
        self.redis_client.close()
        logger.info("Consumer closed")

def main():
    """Main function to run the consumer"""
    consumer = ChurnEventConsumer()
    
    try:
        consumer.start_consuming()
    except KeyboardInterrupt:
        logger.info("Stopping consumer...")
    except Exception as e:
        logger.error(f"Consumer error: {e}")
    finally:
        consumer.close()

if __name__ == "__main__":
    main()
