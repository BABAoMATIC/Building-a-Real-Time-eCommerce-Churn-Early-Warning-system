#!/usr/bin/env python3
"""
Test script for the Kafka User Event Producer

This script tests the producer by sending a few sample events.
"""

import json
import time
from user_event_producer import UserEventProducer

def test_producer():
    """Test the producer with a few sample events"""
    print("Testing Kafka User Event Producer")
    print("=" * 40)
    
    # Create producer
    producer = UserEventProducer()
    
    try:
        print("Sending 5 test events...")
        
        for i in range(5):
            # Generate event
            event = producer.generate_user_event()
            
            # Print event details
            print(f"\nEvent {i+1}:")
            print(json.dumps(event, indent=2))
            
            # Send event
            success = producer.send_event(event)
            
            if success:
                print("✅ Event sent successfully")
            else:
                print("❌ Failed to send event")
            
            # Wait 1 second between events
            if i < 4:  # Don't wait after the last event
                time.sleep(1)
        
        print(f"\n✅ Test completed! Sent 5 events to topic: {producer.topic}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        producer.close()

if __name__ == "__main__":
    test_producer()
