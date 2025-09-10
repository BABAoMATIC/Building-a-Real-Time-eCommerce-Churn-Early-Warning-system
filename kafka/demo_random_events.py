#!/usr/bin/env python3
"""
Demo script for Random Event Producer

This script demonstrates what events would be generated without requiring Kafka to be running.
"""

import json
import random
from datetime import datetime
from random_event_producer import RandomEventProducer

def demo_events():
    """Generate and display sample events"""
    print("Random Event Producer Demo")
    print("=" * 50)
    print("This shows what events would be sent to Kafka every 3 seconds")
    print()
    
    # Create producer instance (without initializing Kafka connection)
    producer = RandomEventProducer.__new__(RandomEventProducer)
    producer.event_types = ["add_to_cart", "bounce", "product_view"]
    producer.product_ids = [f"PROD-{i:04d}" for i in range(1, 101)]
    producer.pages = [
        "/home", "/products", "/product-detail", "/cart", "/checkout", 
        "/profile", "/orders", "/search", "/category", "/about"
    ]
    
    print("Generating 10 sample events...")
    print()
    
    for i in range(10):
        # Generate event
        event = producer.generate_random_event()
        
        print(f"Event {i+1}:")
        print(f"  User ID: {event['user_id']}")
        print(f"  Event Type: {event['event_type']}")
        print(f"  Timestamp: {event['timestamp']}")
        print(f"  Metadata: {json.dumps(event['metadata'], indent=4)}")
        print("-" * 50)
    
    print()
    print("Event Types Distribution:")
    event_counts = {"add_to_cart": 0, "bounce": 0, "product_view": 0}
    
    # Generate 100 events to show distribution
    for _ in range(100):
        event = producer.generate_random_event()
        event_counts[event['event_type']] += 1
    
    for event_type, count in event_counts.items():
        percentage = (count / 100) * 100
        print(f"  {event_type}: {count} events ({percentage:.1f}%)")
    
    print()
    print("Sample Event Formats:")
    print()
    
    # Show one example of each event type
    for event_type in producer.event_types:
        # Generate multiple events until we get the desired type
        for _ in range(10):
            event = producer.generate_random_event()
            if event['event_type'] == event_type:
                print(f"{event_type.upper()} Event:")
                print(json.dumps(event, indent=2))
                print()
                break

if __name__ == "__main__":
    demo_events()
