import os
import json
import time
import logging
import random
from datetime import datetime, timedelta
from typing import Dict, List
import pandas as pd
import numpy as np
from kafka import KafkaProducer
from kafka.errors import KafkaError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CustomerEventProducer:
    """Kafka producer for customer behavior events"""
    
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BROKER', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        
        # Initialize Kafka producer
        self.producer = KafkaProducer(
            bootstrap_servers=[self.bootstrap_servers],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            retries=3,
            retry_backoff_ms=100,
            request_timeout_ms=30000,
            acks='all'  # Wait for all replicas to acknowledge
        )
        
        logger.info(f"Producer initialized for servers: {self.bootstrap_servers}")
    
    def send_customer_event(self, event_type: str, customer_id: str, event_data: Dict):
        """Send a customer event to Kafka"""
        try:
            event = {
                'event_id': f"{customer_id}_{int(time.time() * 1000)}",
                'event_type': event_type,
                'customer_id': customer_id,
                'timestamp': datetime.utcnow().isoformat(),
                'data': event_data
            }
            
            # Send to Kafka topic
            future = self.producer.send(
                self.topic,
                key=customer_id,
                value=event
            )
            
            # Wait for confirmation
            record_metadata = future.get(timeout=10)
            logger.info(f"Event sent: {event_type} for customer {customer_id} to partition {record_metadata.partition}")
            
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to send event: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return False
    
    def generate_sample_events(self, num_events: int = 100):
        """Generate sample customer events for testing"""
        event_types = [
            'order_placed',
            'order_cancelled',
            'payment_failed',
            'support_ticket_created',
            'email_opened',
            'email_clicked',
            'login',
            'product_viewed',
            'cart_abandoned',
            'review_submitted',
            'refund_requested',
            'subscription_cancelled'
        ]
        
        customer_ids = [f"CUST-{i:03d}" for i in range(1, 51)]  # 50 customers
        
        for _ in range(num_events):
            event_type = random.choice(event_types)
            customer_id = random.choice(customer_ids)
            
            # Generate event-specific data
            event_data = self._generate_event_data(event_type)
            
            # Send event
            self.send_customer_event(event_type, customer_id, event_data)
            
            # Random delay between events
            time.sleep(random.uniform(0.1, 2.0))
    
    def _generate_event_data(self, event_type: str) -> Dict:
        """Generate realistic event data based on event type"""
        base_data = {
            'session_id': f"session_{random.randint(1000, 9999)}",
            'user_agent': 'Mozilla/5.0 (compatible; CustomerBot/1.0)',
            'ip_address': f"192.168.1.{random.randint(1, 254)}"
        }
        
        if event_type == 'order_placed':
            return {
                **base_data,
                'order_id': f"ORD-{random.randint(10000, 99999)}",
                'order_value': round(random.uniform(25, 500), 2),
                'items_count': random.randint(1, 10),
                'payment_method': random.choice(['credit_card', 'paypal', 'apple_pay']),
                'shipping_address': f"Address {random.randint(1, 1000)}"
            }
        
        elif event_type == 'payment_failed':
            return {
                **base_data,
                'order_id': f"ORD-{random.randint(10000, 99999)}",
                'failure_reason': random.choice(['insufficient_funds', 'expired_card', 'declined']),
                'retry_count': random.randint(1, 3)
            }
        
        elif event_type == 'support_ticket_created':
            return {
                **base_data,
                'ticket_id': f"TKT-{random.randint(1000, 9999)}",
                'category': random.choice(['billing', 'shipping', 'product', 'technical']),
                'priority': random.choice(['low', 'medium', 'high', 'urgent']),
                'description': f"Support request: {random.choice(['refund', 'exchange', 'question', 'complaint'])}"
            }
        
        elif event_type in ['email_opened', 'email_clicked']:
            return {
                **base_data,
                'email_id': f"email_{random.randint(1000, 9999)}",
                'campaign_id': f"campaign_{random.randint(1, 20)}",
                'subject': random.choice(['Welcome!', 'Special Offer', 'Order Update', 'Newsletter']),
                'template': random.choice(['welcome', 'promotional', 'transactional', 'newsletter'])
            }
        
        elif event_type == 'login':
            return {
                **base_data,
                'login_method': random.choice(['email', 'social_google', 'social_facebook']),
                'device_type': random.choice(['desktop', 'mobile', 'tablet']),
                'success': random.choice([True, True, True, False])  # 75% success rate
            }
        
        elif event_type == 'product_viewed':
            return {
                **base_data,
                'product_id': f"PROD-{random.randint(1000, 9999)}",
                'category': random.choice(['electronics', 'clothing', 'books', 'home']),
                'price': round(random.uniform(10, 200), 2),
                'view_duration': random.randint(5, 300)  # seconds
            }
        
        elif event_type == 'cart_abandoned':
            return {
                **base_data,
                'cart_id': f"cart_{random.randint(1000, 9999)}",
                'items_count': random.randint(1, 5),
                'total_value': round(random.uniform(50, 300), 2),
                'abandonment_reason': random.choice(['price_too_high', 'shipping_cost', 'checkout_complexity', 'payment_issues'])
            }
        
        else:
            return base_data
    
    def close(self):
        """Close the producer"""
        self.producer.close()
        logger.info("Producer closed")

def main():
    """Main function to run the producer"""
    producer = CustomerEventProducer()
    
    try:
        logger.info("Starting customer event producer...")
        logger.info("Generating sample events (Ctrl+C to stop)")
        
        while True:
            # Generate a batch of events
            producer.generate_sample_events(num_events=10)
            
            # Wait before next batch
            time.sleep(30)  # Generate events every 30 seconds
            
    except KeyboardInterrupt:
        logger.info("Stopping producer...")
    except Exception as e:
        logger.error(f"Producer error: {e}")
    finally:
        producer.close()

if __name__ == "__main__":
    main()
