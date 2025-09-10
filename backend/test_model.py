#!/usr/bin/env python3
"""
Test the trained churn prediction model
"""

import pandas as pd
import numpy as np
import joblib
from datetime import datetime

def test_model():
    """Test the trained model with sample data"""
    
    # Load the trained model
    try:
        model_data = joblib.load('models/model.pkl')
        model = model_data['model']
        scaler = model_data['scaler']
        label_encoders = model_data['label_encoders']
        feature_columns = model_data['feature_columns']
        
        print("Model loaded successfully!")
        print(f"Training date: {model_data.get('training_date', 'Unknown')}")
        print(f"Features: {feature_columns}")
        
    except FileNotFoundError:
        print("Model file not found. Please run train_model.py first.")
        return
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Create test data
    test_cases = [
        {
            'user_id': 'test_user_001',
            'event_type': 'bounce',
            'session_length': 1.5,
            'cart_items': 0,
            'time_since_last_event': 24.0
        },
        {
            'user_id': 'test_user_002',
            'event_type': 'purchase',
            'session_length': 45.0,
            'cart_items': 3,
            'time_since_last_event': 2.0
        },
        {
            'user_id': 'test_user_003',
            'event_type': 'page_view',
            'session_length': 15.0,
            'cart_items': 1,
            'time_since_last_event': 12.0
        },
        {
            'user_id': 'test_user_004',
            'event_type': 'add_to_cart',
            'session_length': 30.0,
            'cart_items': 5,
            'time_since_last_event': 1.0
        }
    ]
    
    print("\nTesting model predictions:")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['user_id']}")
        print(f"Event Type: {test_case['event_type']}")
        print(f"Session Length: {test_case['session_length']} minutes")
        print(f"Cart Items: {test_case['cart_items']}")
        print(f"Time Since Last Event: {test_case['time_since_last_event']} hours")
        
        # Prepare features
        df_test = pd.DataFrame([test_case])
        
        # Encode event_type
        if 'event_type' in label_encoders:
            df_test['event_type_encoded'] = label_encoders['event_type'].transform([test_case['event_type']])
        else:
            df_test['event_type_encoded'] = 0
        
        # Select features in correct order
        X_test = df_test[feature_columns]
        
        # Scale features
        X_test_scaled = scaler.transform(X_test)
        
        # Make prediction
        churn_probability = model.predict_proba(X_test_scaled)[0][1]
        churn_prediction = model.predict(X_test_scaled)[0]
        
        print(f"Churn Probability: {churn_probability:.4f}")
        print(f"Churn Prediction: {'Yes' if churn_prediction == 1 else 'No'}")
        print(f"Risk Level: {'High' if churn_probability > 0.7 else 'Medium' if churn_probability > 0.4 else 'Low'}")

if __name__ == "__main__":
    test_model()
