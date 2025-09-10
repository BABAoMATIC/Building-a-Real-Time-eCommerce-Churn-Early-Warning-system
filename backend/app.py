import os
import json
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

def calculate_churn_score(event_type: str, metadata: dict = None) -> float:
    """
    Calculate churn score based on rule-based logic
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
        "service": "churn-prediction-api"
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
        "metadata": {}
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
        
        # Calculate churn score using rule-based logic
        churn_score = calculate_churn_score(event_type, metadata)
        
        # Print prediction to console
        print(f"[{datetime.now().isoformat()}] Prediction - User: {user_id}, Event: {event_type}, Churn Score: {churn_score}")
        
        # Return response
        response = {
            "churn_score": churn_score
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] Error in predict_churn: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print(f"Starting Flask API server...")
    print(f"Port: {Config.FLASK_PORT}")
    print(f"Debug: {Config.FLASK_DEBUG}")
    print(f"Environment: {Config.FLASK_ENV}")
    
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
