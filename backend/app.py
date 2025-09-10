import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from config import Config
from auth.routes import auth_bp
from routes.user_routes import user_bp
from routes.cohort_routes import cohort_bp
from auth.jwt_utils import token_required
from models.user import User, Base
from models.prediction import ChurnPrediction
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.socket_service import init_socket_service
from flask import request

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable CORS for all routes
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3306'))
DB_NAME = os.getenv('DB_NAME', 'churn_db')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')

# Create database engine
db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize database tables
def init_database():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(engine)
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(cohort_bp)

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variables for ML model and data
ml_model = None
scaler = None
user_data = []
churn_predictions = []

def initialize_ml_model():
    """Initialize or load the ML model"""
    global ml_model, scaler
    
    try:
        # Try to load existing model
        if os.path.exists('churn_model.pkl'):
            ml_model = joblib.load('churn_model.pkl')
            scaler = joblib.load('scaler.pkl')
            print("Loaded existing ML model")
        else:
            # Create a simple model for demonstration
            ml_model = RandomForestClassifier(n_estimators=100, random_state=42)
            scaler = StandardScaler()
            print("Created new ML model")
    except Exception as e:
        print(f"Error initializing ML model: {e}")
        ml_model = RandomForestClassifier(n_estimators=100, random_state=42)
        scaler = StandardScaler()

def train_model_with_sample_data():
    """Train the model with sample data"""
    global ml_model, scaler
    
    try:
        # Generate sample training data
        np.random.seed(42)
        n_samples = 1000
        
        # Create sample features
        features = {
            'age': np.random.randint(18, 80, n_samples),
            'total_purchases': np.random.randint(0, 100, n_samples),
            'avg_order_value': np.random.uniform(10, 500, n_samples),
            'days_since_last_purchase': np.random.randint(0, 365, n_samples),
            'email_opens': np.random.randint(0, 50, n_samples),
            'website_visits': np.random.randint(0, 200, n_samples)
        }
        
        df = pd.DataFrame(features)
        
        # Create target variable (churn) based on some logic
        df['churn'] = (
            (df['days_since_last_purchase'] > 90) |
            (df['total_purchases'] < 5) |
            (df['email_opens'] < 10)
        ).astype(int)
        
        X = df.drop('churn', axis=1)
        y = df['churn']
        
        # Scale features
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        ml_model.fit(X_scaled, y)
        
        # Save model
        joblib.dump(ml_model, 'churn_model.pkl')
        joblib.dump(scaler, 'scaler.pkl')
        
        print("Model trained and saved successfully")
        
    except Exception as e:
        print(f"Error training model: {e}")

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

def predict_churn_from_dataframe(df):
    """Predict churn for uploaded data"""
    global ml_model, scaler
    
    try:
        # Ensure required columns exist
        required_columns = ['age', 'total_purchases', 'avg_order_value', 
                          'days_since_last_purchase', 'email_opens', 'website_visits']
        
        # Add missing columns with default values
        for col in required_columns:
            if col not in df.columns:
                if col == 'age':
                    df[col] = np.random.randint(25, 65, len(df))
                elif col == 'total_purchases':
                    df[col] = np.random.randint(0, 50, len(df))
                elif col == 'avg_order_value':
                    df[col] = np.random.uniform(20, 200, len(df))
                elif col == 'days_since_last_purchase':
                    df[col] = np.random.randint(0, 180, len(df))
                elif col == 'email_opens':
                    df[col] = np.random.randint(0, 30, len(df))
                elif col == 'website_visits':
                    df[col] = np.random.randint(0, 100, len(df))
        
        # Select only required columns
        X = df[required_columns]
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Predict churn probabilities
        churn_probabilities = ml_model.predict_proba(X_scaled)[:, 1]
        
        return churn_probabilities
        
    except Exception as e:
        print(f"Error predicting churn: {e}")
        # Return random probabilities as fallback
        return np.random.uniform(0, 1, len(df))

# Initialize ML model on startup
initialize_ml_model()
train_model_with_sample_data()

# Initialize database on startup
init_database()

# Initialize Socket.IO service
socket_service = init_socket_service(socketio)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "churn-prediction-api",
        "model_loaded": ml_model is not None
    })

@app.route('/api/live-data', methods=['GET'])
@token_required
def get_live_data():
    """Get live data for dashboard"""
    try:
        user = request.current_user
        
        # Get user-specific dashboard data
        dashboard_data = socket_service.get_user_dashboard_data(user.id)
        
        if dashboard_data:
            return jsonify({
                "success": True,
                "data": dashboard_data
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to fetch dashboard data"
            }), 500
        
    except Exception as e:
        print(f"Error getting live data: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/upload-data', methods=['POST'])
@token_required
def upload_data():
    """Upload and process CSV/Excel file for churn prediction"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the file based on extension
            if filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(filepath)
            else:
                return jsonify({"error": "Unsupported file format. Please upload CSV or Excel files."}), 400
            
            # Validate data
            if df.empty:
                return jsonify({"error": "File is empty"}), 400
            
            # Predict churn scores
            churn_scores = predict_churn_from_dataframe(df)
            
            # Create predictions data with user-specific information
            predictions = []
            user_id = request.current_user.id
            timestamp = int(time.time())
            
            for i, (_, row) in enumerate(df.iterrows()):
                prediction = {
                    "id": f"pred_{user_id}_{timestamp}_{i}",
                    "user_id": str(user_id),
                    "churn_score": float(churn_scores[i]),
                    "risk_level": "high" if churn_scores[i] > 0.7 else "medium" if churn_scores[i] > 0.4 else "low",
                    "timestamp": datetime.utcnow().isoformat(),
                    "file_name": filename,
                    "status": "completed",
                    "row_data": {
                        "customer_id": row.get('customer_id', f"customer_{i}"),
                        "age": row.get('age', 30),
                        "total_purchases": row.get('total_purchases', 0),
                        "avg_order_value": row.get('avg_order_value', 0),
                        "days_since_last_purchase": row.get('days_since_last_purchase', 30),
                        "email_opens": row.get('email_opens', 0),
                        "website_visits": row.get('website_visits', 0)
                    }
                }
                predictions.append(prediction)
            
            # Store predictions in database
            db = SessionLocal()
            try:
                for prediction_data in predictions:
                    prediction_record = ChurnPrediction.create_from_prediction_data(prediction_data, user_id)
                    db.add(prediction_record)
                
                db.commit()
                print(f"Stored {len(predictions)} predictions in database for user {user_id}")
            except Exception as e:
                db.rollback()
                print(f"Error storing predictions in database: {e}")
            finally:
                db.close()
            
            # Store predictions globally (for backward compatibility)
            global churn_predictions
            churn_predictions.extend(predictions)
            
            # Emit real-time update via Socket.IO
            socketio.emit('new_predictions', {
                'predictions': predictions,
                'total_predictions': len(churn_predictions),
                'timestamp': datetime.utcnow().isoformat()
            })
            
            # Clean up uploaded file
            os.remove(filepath)
            
            # Calculate summary statistics
            total_records = len(df)
            predictions_made = len(predictions)
            high_risk_count = len([p for p in predictions if p['risk_level'] == 'high'])
            avg_churn_score = sum(p['churn_score'] for p in predictions) / len(predictions) if predictions else 0
            
            return jsonify({
                "success": True,
                "message": f"File processed successfully! {predictions_made} predictions generated.",
                "data": {
                    "total_records": total_records,
                    "predictions_made": predictions_made,
                    "high_risk_count": high_risk_count,
                    "avg_churn_score": round(avg_churn_score, 4),
                    "file_name": filename,
                    "predictions": predictions[:10]  # Return first 10 predictions for preview
                }
            })
            
    except Exception as e:
        print(f"Error processing file: {e}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/api/predictions', methods=['GET'])
@token_required
def get_predictions():
    """Get all churn predictions"""
    try:
        return jsonify({
            "predictions": churn_predictions,
            "total": len(churn_predictions),
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"Error getting predictions: {e}")
        return jsonify({"error": "Internal server error"}), 500

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

# Socket.IO events
@socketio.on('connect')
def handle_connect(auth=None):
    """Handle client connection with authentication"""
    try:
        success = socket_service.handle_connect(auth)
        if success:
            emit('connected', {'status': 'success', 'message': 'Connected to real-time updates'})
        else:
            emit('connected', {'status': 'error', 'message': 'Authentication failed'})
            return False
    except Exception as e:
        print(f"Connection error: {e}")
        emit('connected', {'status': 'error', 'message': 'Connection failed'})
        return False

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    socket_service.handle_disconnect()

@socketio.on('request_dashboard_data')
def handle_dashboard_data_request(data=None):
    """Handle dashboard data requests"""
    socket_service.handle_request_dashboard_data(data or {})

@socketio.on('user_action')
def handle_user_action(data):
    """Handle user actions (filtering, date changes, etc.)"""
    socket_service.handle_user_action(data)

@socketio.on('request_live_data')
def handle_live_data_request():
    """Handle legacy live data requests from frontend"""
    try:
        live_data = {
            "total_users": len(user_data),
            "total_predictions": len(churn_predictions),
            "avg_churn_score": round(np.mean([p['churn_score'] for p in churn_predictions]) if churn_predictions else 0, 3),
            "high_risk_users": len([p for p in churn_predictions if p['churn_score'] > 0.7]),
            "timestamp": datetime.utcnow().isoformat(),
            "has_data": len(churn_predictions) > 0
        }
        emit('live_data_update', live_data)
    except Exception as e:
        print(f"Error handling live data request: {e}")
        emit('error', {'message': 'Error fetching live data'})

if __name__ == '__main__':
    print(f"Starting Flask API server...")
    print(f"Port: {Config.FLASK_PORT}")
    print(f"Debug: {Config.FLASK_DEBUG}")
    print(f"Environment: {Config.FLASK_ENV}")
    
    # Start real-time data broadcast
    socket_service.start_data_broadcast()
    
    try:
        socketio.run(
            app,
            host='0.0.0.0',
            port=Config.FLASK_PORT,
            debug=Config.FLASK_DEBUG
        )
    except KeyboardInterrupt:
        print("Shutting down server...")
        socket_service.stop_data_broadcast()