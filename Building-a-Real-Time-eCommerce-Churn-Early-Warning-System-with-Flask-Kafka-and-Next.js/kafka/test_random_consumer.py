#!/usr/bin/env python3
"""
Test Consumer for Random Events

This script consumes random user events from the 'user-events' Kafka topic
and displays them in the console.
"""

import json
import logging
from kafka import KafkaConsumer
from kafka.errors import KafkaError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RandomEventConsumer:
    """Kafka consumer for random user events"""
    
    def __init__(self, bootstrap_servers='localhost:9092', topic='user-events'):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        
        # Initialize Kafka consumer
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=[self.bootstrap_servers],
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                auto_offset_reset='latest',  # Start from latest messages
                group_id='test-consumer-group',
                enable_auto_commit=True
            )
            logger.info(f"Consumer initialized for servers: {self.bootstrap_servers}")
            logger.info(f"Topic: {self.topic}")
            
        except Exception as e:
            logger.error(f"Failed to initialize consumer: {e}")
            raise
    
    def consume_events(self, max_events=10):
        """Consume and display events from the topic"""
        logger.info(f"Starting to consume up to {max_events} events...")
        logger.info("Press Ctrl+C to stop")
        
        event_count = 0
        
        try:
            for message in self.consumer:
                event_count += 1
                
                # Extract event data
                event = message.value
                key = message.key
                
                # Log the event
                logger.info(f"Event #{event_count} received:")
                logger.info(f"  Key: {key}")
                logger.info(f"  User ID: {event.get('user_id')}")
                logger.info(f"  Event Type: {event.get('event_type')}")
                logger.info(f"  Timestamp: {event.get('timestamp')}")
                logger.info(f"  Metadata: {json.dumps(event.get('metadata', {}), indent=2)}")
                logger.info(f"  Partition: {message.partition}, Offset: {message.offset}")
                logger.info("-" * 50)
                
                # Stop after consuming max_events
                if event_count >= max_events:
                    logger.info(f"Consumed {max_events} events. Stopping...")
                    break
                
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            self.close()
    
    def close(self):
        """Close the consumer"""
        if hasattr(self, 'consumer'):
            self.consumer.close()
            logger.info("Consumer closed")

def main():
    """Main function"""
    # Configuration
    KAFKA_SERVERS = 'localhost:9092'
    TOPIC = 'user-events'
    MAX_EVENTS = 10
    
    # Create and run consumer
    consumer = RandomEventConsumer(
        bootstrap_servers=KAFKA_SERVERS,
        topic=TOPIC
    )
    
    consumer.consume_events(max_events=MAX_EVENTS)

if __name__ == "__main__":
    main()
