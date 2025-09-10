import os
import json
import pandas as pd
import joblib
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load configuration
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Global variables for ML model
model = None
scaler = None
label_encoders = None
feature_columns = None

def load_model():
    """Load the trained ML model"""
    global model, scaler, label_encoders, feature_columns
    
    try:
        model_path = 'models/model.pkl'
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            model = model_data['model']
            scaler = model_data['scaler']
            label_encoders = model_data['label_encoders']
            feature_columns = model_data['feature_columns']
            print(f"ML model loaded successfully from {model_path}")
            return True
        else:
            print(f"Model file {model_path} not found. Using rule-based fallback.")
            return False
    except Exception as e:
        print(f"Error loading ML model: {e}. Using rule-based fallback.")
        return False

def calculate_churn_score_ml(user_id, event_type, timestamp, metadata):
    """Calculate churn score using trained ML model"""
    global model, scaler, label_encoders, feature_columns
    
    if model is None:
        return calculate_churn_score_rule_based(event_type, metadata)
    
    try:
        # Extract features from metadata or use defaults
        session_length = metadata.get('session_length', 10.0)
        cart_items = metadata.get('cart_items', 0)
        time_since_last_event = metadata.get('time_since_last_event', 2.0)
        
        # Encode event_type
        if 'event_type' in label_encoders:
            event_type_encoded = label_encoders['event_type'].transform([event_type])[0]
        else:
            event_type_encoded = 0
        
        # Create feature vector
        features = pd.DataFrame([{
            'event_type_encoded': event_type_encoded,
            'session_length': session_length,
            'cart_items': cart_items,
            'time_since_last_event': time_since_last_event
        }])
        
        # Ensure correct feature order
        X = features[feature_columns]
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Predict churn probability
        churn_probability = model.predict_proba(X_scaled)[0][1]
        
        return float(churn_probability)
        
    except Exception as e:
        print(f"Error in ML prediction: {e}. Falling back to rule-based logic.")
        return calculate_churn_score_rule_based(event_type, metadata)

def calculate_churn_score_rule_based(event_type: str, metadata: dict = None) -> float:
    """
    Fallback rule-based logic
    - bounce = 0.9
    - others = 0.2
    """
    if event_type.lower() == 'bounce':
        return 0.9
    else:
        return 0.2

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "churn-prediction-api",
        "model_loaded": model is not None,
        "model_type": "ML" if model is not None else "rule-based"
    })

@app.route('/predict-churn', methods=['POST'])
def predict_churn():
    """
    Predict churn score for a user based on event data
    
    Input JSON:
    {
        "user_id": "string",
        "event_type": "string", 
        "timestamp": "string",
        "metadata": {
            "session_length": float,
            "cart_items": int,
            "time_since_last_event": float
        }
    }
    
    Output JSON:
    {
        "churn_score": float (0-1)
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        required_fields = ['user_id', 'event_type', 'timestamp']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Extract data
        user_id = data['user_id']
        event_type = data['event_type']
        timestamp = data['timestamp']
        metadata = data.get('metadata', {})
        
        # Calculate churn score using ML model or rule-based logic
        churn_score = calculate_churn_score_ml(user_id, event_type, timestamp, metadata)
        
        # Print prediction to console
        model_type = "ML" if model is not None else "rule-based"
        print(f"[{datetime.now().isoformat()}] Prediction ({model_type}) - User: {user_id}, Event: {event_type}, Churn Score: {churn_score:.4f}")
        
        # Return response
        response = {
            "churn_score": churn_score
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] Error in predict_churn: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Load ML model on startup
    load_model()
    
    print(f"Starting Flask API server...")
    print(f"Port: {Config.FLASK_PORT}")
    print(f"Debug: {Config.FLASK_DEBUG}")
    print(f"Environment: {Config.FLASK_ENV}")
    
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
