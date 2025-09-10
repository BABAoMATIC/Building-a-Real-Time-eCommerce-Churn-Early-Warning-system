#!/usr/bin/env python3
"""
Train Churn Prediction Model

This script trains a LogisticRegression model to predict customer churn
based on user event data. It reads a CSV file with user events and
creates features for training.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class ChurnModelTrainer:
    """Trainer class for churn prediction model"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = ['event_type_encoded', 'session_length', 'cart_items', 'time_since_last_event']
        
    def generate_dummy_data(self, n_users=1000, n_events_per_user=50):
        """Generate dummy user event data for training"""
        print("Generating dummy user event data...")
        
        # Set random seed for reproducibility
        np.random.seed(42)
        
        # Event types and their churn probabilities
        event_types = ['page_view', 'add_to_cart', 'purchase', 'bounce', 'login', 'logout', 'search', 'product_view']
        event_churn_weights = {
            'bounce': 0.8,
            'logout': 0.3,
            'page_view': 0.1,
            'add_to_cart': 0.2,
            'purchase': -0.5,  # Negative weight (reduces churn)
            'login': -0.2,
            'search': 0.1,
            'product_view': 0.05
        }
        
        data = []
        base_time = datetime.now() - timedelta(days=90)
        
        for user_id in range(1, n_users + 1):
            # Generate user characteristics
            user_activity_level = np.random.choice(['low', 'medium', 'high'], p=[0.3, 0.5, 0.2])
            is_churner = np.random.random() < 0.2  # 20% churn rate
            
            # Adjust event generation based on churn probability
            if is_churner:
                # Churners tend to have more bounce events and shorter sessions
                event_weights = [0.15, 0.1, 0.05, 0.3, 0.1, 0.2, 0.05, 0.05]
            else:
                # Non-churners have more positive events
                event_weights = [0.2, 0.2, 0.15, 0.05, 0.15, 0.1, 0.1, 0.05]
            
            # Generate events for this user
            n_events = np.random.poisson(n_events_per_user)
            if user_activity_level == 'low':
                n_events = max(5, int(n_events * 0.5))
            elif user_activity_level == 'high':
                n_events = int(n_events * 1.5)
            
            session_length = 0
            cart_items = 0
            last_event_time = base_time
            
            for event_idx in range(n_events):
                # Select event type based on weights
                event_type = np.random.choice(event_types, p=event_weights)
                
                # Generate session length (in minutes)
                if event_type in ['bounce', 'logout']:
                    session_length = np.random.exponential(2)  # Short sessions
                else:
                    session_length += np.random.exponential(5)
                
                # Generate cart items
                if event_type == 'add_to_cart':
                    cart_items += np.random.poisson(1.5)
                elif event_type == 'purchase':
                    cart_items = max(0, cart_items - np.random.poisson(2))
                
                # Generate timestamp
                time_since_last = np.random.exponential(30)  # minutes
                event_time = last_event_time + timedelta(minutes=time_since_last)
                last_event_time = event_time
                
                # Calculate time since last event (for the next event)
                if event_idx < n_events - 1:
                    next_time_since = np.random.exponential(30)
                else:
                    # For the last event, calculate time since now
                    next_time_since = (datetime.now() - event_time).total_seconds() / 3600  # hours
                
                data.append({
                    'user_id': f'user_{user_id:04d}',
                    'event_type': event_type,
                    'timestamp': event_time.isoformat(),
                    'session_length': min(session_length, 120),  # Cap at 2 hours
                    'cart_items': min(cart_items, 20),  # Cap at 20 items
                    'time_since_last_event': next_time_since,
                    'churn': int(is_churner)
                })
        
        df = pd.DataFrame(data)
        print(f"Generated {len(df)} events for {n_users} users")
        print(f"Churn rate: {df['churn'].mean():.2%}")
        
        return df
    
    def load_data(self, csv_path='user_events.csv'):
        """Load data from CSV file or generate dummy data if file doesn't exist"""
        if os.path.exists(csv_path):
            print(f"Loading data from {csv_path}")
            df = pd.read_csv(csv_path)
        else:
            print(f"CSV file {csv_path} not found. Generating dummy data...")
            df = self.generate_dummy_data()
            # Save dummy data for future use
            df.to_csv(csv_path, index=False)
            print(f"Dummy data saved to {csv_path}")
        
        return df
    
    def prepare_features(self, df):
        """Prepare features for training"""
        print("Preparing features...")
        
        # Encode event_type
        if 'event_type' in df.columns:
            le = LabelEncoder()
            df['event_type_encoded'] = le.fit_transform(df['event_type'])
            self.label_encoders['event_type'] = le
        
        # Ensure all required features exist
        for feature in ['session_length', 'cart_items', 'time_since_last_event']:
            if feature not in df.columns:
                print(f"Warning: {feature} not found in data. Generating dummy values...")
                if feature == 'session_length':
                    df[feature] = np.random.exponential(10, len(df))
                elif feature == 'cart_items':
                    df[feature] = np.random.poisson(2, len(df))
                elif feature == 'time_since_last_event':
                    df[feature] = np.random.exponential(2, len(df))
        
        # Select features
        X = df[self.feature_columns].copy()
        
        # Handle missing values
        X = X.fillna(X.median())
        
        return X
    
    def train_model(self, X, y):
        """Train the LogisticRegression model"""
        print("Training LogisticRegression model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = LogisticRegression(
            random_state=42,
            max_iter=1000,
            class_weight='balanced'  # Handle class imbalance
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        print("\nModel Evaluation:")
        print("=" * 50)
        print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'coefficient': self.model.coef_[0]
        }).sort_values('coefficient', key=abs, ascending=False)
        
        print("\nFeature Importance (Coefficients):")
        print(feature_importance)
        
        return self.model
    
    def save_model(self, model_path='model.pkl'):
        """Save the trained model and preprocessing objects"""
        print(f"Saving model to {model_path}...")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns,
            'training_date': datetime.now().isoformat()
        }
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path) if os.path.dirname(model_path) else '.', exist_ok=True)
        
        joblib.dump(model_data, model_path)
        print(f"Model saved successfully to {model_path}")
    
    def load_model(self, model_path='model.pkl'):
        """Load a trained model"""
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoders = model_data['label_encoders']
            self.feature_columns = model_data['feature_columns']
            print(f"Model loaded from {model_path}")
            return True
        else:
            print(f"Model file {model_path} not found")
            return False

def main():
    """Main training function"""
    print("Churn Prediction Model Training")
    print("=" * 40)
    
    # Initialize trainer
    trainer = ChurnModelTrainer()
    
    # Load or generate data
    df = trainer.load_data('user_events.csv')
    
    # Prepare features
    X = trainer.prepare_features(df)
    y = df['churn']
    
    print(f"\nDataset Info:")
    print(f"Total samples: {len(df)}")
    print(f"Features: {list(X.columns)}")
    print(f"Churn rate: {y.mean():.2%}")
    
    # Train model
    model = trainer.train_model(X, y)
    
    # Save model
    trainer.save_model('models/model.pkl')
    
    print("\nTraining completed successfully!")
    print("Model saved to models/model.pkl")

if __name__ == "__main__":
    main()
