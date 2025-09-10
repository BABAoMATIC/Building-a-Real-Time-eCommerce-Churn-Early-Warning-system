#!/usr/bin/env python3
"""
Demo script for Churn Prediction Consumer

This script demonstrates how the consumer would process events without requiring
Kafka, Flask API, or MySQL to be running.
"""

import json
import time
from datetime import datetime
from random_event_producer import RandomEventProducer

def simulate_flask_api_call(event):
    """Simulate Flask API call for churn prediction"""
    # Simulate the same logic as the Flask API
    if event['event_type'].lower() == 'bounce':
        return 0.9
    else:
        return 0.2

def simulate_database_save(event, churn_score):
    """Simulate database save operation"""
    # In real implementation, this would save to MySQL
    return True

def demo_consumer_processing():
    """Demonstrate consumer processing logic"""
    print("Churn Prediction Consumer Demo")
    print("=" * 50)
    print("This demonstrates how events would be processed:")
    print("1. Receive event from Kafka")
    print("2. Send to Flask API for churn prediction")
    print("3. Save prediction to MySQL database")
    print("4. Log processing results")
    print()
    
    # Create producer instance for generating sample events
    producer = RandomEventProducer.__new__(RandomEventProducer)
    producer.event_types = ["add_to_cart", "bounce", "product_view"]
    producer.product_ids = [f"PROD-{i:04d}" for i in range(1, 101)]
    producer.pages = [
        "/home", "/products", "/product-detail", "/cart", "/checkout", 
        "/profile", "/orders", "/search", "/category", "/about"
    ]
    
    # Statistics
    stats = {
        'events_processed': 0,
        'predictions_saved': 0,
        'errors': 0
    }
    
    print("Processing 10 sample events...")
    print()
    
    for i in range(10):
        # Generate random event (simulating Kafka message)
        event = producer.generate_random_event()
        
        print(f"Event {i+1}:")
        print(f"  📥 Received from Kafka:")
        print(f"    User ID: {event['user_id']}")
        print(f"    Event Type: {event['event_type']}")
        print(f"    Timestamp: {event['timestamp']}")
        print(f"    Metadata: {json.dumps(event['metadata'], separators=(',', ':'))}")
        
        # Step 1: Send to Flask API (simulated)
        print(f"  🔄 Sending to Flask API...")
        churn_score = simulate_flask_api_call(event)
        print(f"    ✅ Churn Score: {churn_score}")
        
        # Step 2: Save to database (simulated)
        print(f"  💾 Saving to MySQL database...")
        success = simulate_database_save(event, churn_score)
        
        if success:
            print(f"    ✅ Saved successfully")
            stats['predictions_saved'] += 1
        else:
            print(f"    ❌ Failed to save")
            stats['errors'] += 1
        
        stats['events_processed'] += 1
        
        # Log the processed event
        print(f"  📝 Logged: Event processed - User: {event['user_id']}, Churn Score: {churn_score}")
        print("-" * 50)
        
        # Simulate processing time
        time.sleep(0.5)
    
    # Print final statistics
    print("\n" + "=" * 50)
    print("PROCESSING STATISTICS")
    print("=" * 50)
    print(f"Events Processed: {stats['events_processed']}")
    print(f"Predictions Saved: {stats['predictions_saved']}")
    print(f"Errors: {stats['errors']}")
    
    if stats['events_processed'] > 0:
        success_rate = (stats['predictions_saved'] / stats['events_processed']) * 100
        print(f"Success Rate: {success_rate:.1f}%")
    
    print("=" * 50)
    
    # Show sample database records
    print("\nSample Database Records:")
    print("-" * 30)
    print("| ID | User ID | Event Type | Churn Score | Timestamp")
    print("-" * 30)
    
    for i in range(1, 6):
        event = producer.generate_random_event()
        churn_score = simulate_flask_api_call(event)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"| {i:2d} | {event['user_id']:7d} | {event['event_type']:11s} | {churn_score:11.1f} | {timestamp}")
    
    print("-" * 30)

def show_consumer_architecture():
    """Show the consumer architecture"""
    print("\nConsumer Architecture:")
    print("=" * 30)
    print("┌─────────────┐    ┌─────────────┐    ┌─────────────┐")
    print("│   Kafka     │───▶│   Consumer  │───▶│ Flask API   │")
    print("│ user-events │    │             │    │ /predict-   │")
    print("│   topic     │    │             │    │ churn       │")
    print("└─────────────┘    └─────────────┘    └─────────────┘")
    print("                           │                   │")
    print("                           ▼                   ▼")
    print("                    ┌─────────────┐    ┌─────────────┐")
    print("                    │   Console   │    │   MySQL     │")
    print("                    │   Logging   │    │  Database   │")
    print("                    └─────────────┘    └─────────────┘")
    print()
    print("Data Flow:")
    print("1. Consumer polls Kafka topic for new messages")
    print("2. For each message, extract event data")
    print("3. Send event to Flask API for churn prediction")
    print("4. Receive churn score from Flask API")
    print("5. Save prediction result to MySQL database")
    print("6. Log processing result to console")

def main():
    """Main demo function"""
    show_consumer_architecture()
    demo_consumer_processing()
    
    print("\n🎉 Demo completed!")
    print("\nTo run the actual consumer:")
    print("1. Start Kafka: docker-compose up kafka zookeeper")
    print("2. Start Flask API: python backend/app.py")
    print("3. Start MySQL: docker-compose up mysql")
    print("4. Run consumer: python churn_prediction_consumer.py")

if __name__ == "__main__":
    main()
