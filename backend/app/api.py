import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
CORS(app)

# Global variables for ML model
model = None
scaler = None

class ChurnPredictor:
    """Churn prediction service using machine learning"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'total_orders', 'total_spent', 'avg_order_value', 'days_since_last_order',
            'support_tickets', 'product_returns', 'email_engagement', 'login_frequency',
            'payment_failures', 'discount_usage', 'loyalty_points', 'account_age_days'
        ]
    
    def load_model(self, model_path: str = None):
        """Load pre-trained model or create new one"""
        global model, scaler
        
        if model_path and os.path.exists(model_path):
            try:
                model_data = joblib.load(model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                model = self.model
                scaler = self.scaler
                logger.info("Model loaded successfully")
                return True
            except Exception as e:
                logger.error(f"Error loading model: {e}")
        
        # Create new model with sample data
        self._create_sample_model()
        return True
    
    def _create_sample_model(self):
        """Create a sample model for demonstration"""
        global model, scaler
        
        # Generate sample training data
        np.random.seed(42)
        n_samples = 1000
        
        # Create synthetic customer data
        data = {
            'total_orders': np.random.poisson(10, n_samples),
            'total_spent': np.random.exponential(500, n_samples),
            'avg_order_value': np.random.normal(50, 15, n_samples),
            'days_since_last_order': np.random.exponential(30, n_samples),
            'support_tickets': np.random.poisson(2, n_samples),
            'product_returns': np.random.poisson(1, n_samples),
            'email_engagement': np.random.uniform(0, 1, n_samples),
            'login_frequency': np.random.poisson(5, n_samples),
            'payment_failures': np.random.poisson(0.5, n_samples),
            'discount_usage': np.random.uniform(0, 1, n_samples),
            'loyalty_points': np.random.exponential(100, n_samples),
            'account_age_days': np.random.exponential(365, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Create target variable (churn)
        churn_score = (
            -df['total_orders'] * 0.1 +
            -df['total_spent'] * 0.001 +
            df['days_since_last_order'] * 0.01 +
            df['support_tickets'] * 0.2 +
            df['payment_failures'] * 0.3 +
            -df['email_engagement'] * 0.5 +
            np.random.normal(0, 0.1, n_samples)
        )
        
        df['churn'] = (churn_score > churn_score.quantile(0.2)).astype(int)
        
        # Prepare features and target
        X = df[self.feature_columns]
        y = df['churn']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Save model
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }
        
        os.makedirs('models', exist_ok=True)
        joblib.dump(model_data, 'models/churn_model.pkl')
        
        model = self.model
        scaler = self.scaler
        
        logger.info("Sample model created and saved")
    
    def predict_churn(self, customer_data: Dict) -> Dict:
        """Predict churn probability for a customer"""
        if not self.model:
            return {"error": "Model not loaded"}
        
        try:
            # Prepare feature vector
            features = []
            for col in self.feature_columns:
                features.append(customer_data.get(col, 0))
            
            features_array = np.array(features).reshape(1, -1)
            features_scaled = self.scaler.transform(features_array)
            
            # Predict probability
            churn_prob = self.model.predict_proba(features_scaled)[0][1]
            
            return {
                "churn_probability": float(churn_prob),
                "risk_level": self._get_risk_level(churn_prob),
                "recommendations": self._get_recommendations(customer_data, churn_prob)
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"error": str(e)}
    
    def _get_risk_level(self, probability: float) -> str:
        """Determine risk level based on probability"""
        if probability >= 0.8:
            return "critical"
        elif probability >= 0.6:
            return "high"
        elif probability >= 0.4:
            return "medium"
        else:
            return "low"
    
    def _get_recommendations(self, customer_data: Dict, probability: float) -> List[str]:
        """Generate recommendations based on customer data and churn probability"""
        recommendations = []
        
        if customer_data.get('days_since_last_order', 0) > 30:
            recommendations.append("Send re-engagement email campaign")
        
        if customer_data.get('support_tickets', 0) > 3:
            recommendations.append("Assign dedicated customer success manager")
        
        if customer_data.get('payment_failures', 0) > 0:
            recommendations.append("Update payment method and offer assistance")
        
        if customer_data.get('email_engagement', 0) < 0.3:
            recommendations.append("Improve email marketing personalization")
        
        if probability > 0.7:
            recommendations.append("Offer exclusive discount or loyalty program")
        
        return recommendations

# Initialize predictor
predictor = ChurnPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": model is not None
    })

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get list of customers with churn predictions"""
    try:
        # Mock customer data - replace with database query
        customers = []
        for i in range(100):
            customer_data = {
                "customer_id": f"CUST-{i+1:03d}",
                "name": f"Customer {i+1}",
                "email": f"customer{i+1}@example.com",
                "total_orders": np.random.poisson(10),
                "total_spent": np.random.exponential(500),
                "avg_order_value": np.random.normal(50, 15),
                "days_since_last_order": np.random.exponential(30),
                "support_tickets": np.random.poisson(2),
                "product_returns": np.random.poisson(1),
                "email_engagement": np.random.uniform(0, 1),
                "login_frequency": np.random.poisson(5),
                "payment_failures": np.random.poisson(0.5),
                "discount_usage": np.random.uniform(0, 1),
                "loyalty_points": np.random.exponential(100),
                "account_age_days": np.random.exponential(365)
            }
            
            # Get churn prediction
            prediction = predictor.predict_churn(customer_data)
            customer_data.update(prediction)
            customers.append(customer_data)
        
        return jsonify({
            "customers": customers,
            "total": len(customers)
        })
    except Exception as e:
        logger.error(f"Error getting customers: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/churn/predict', methods=['POST'])
def predict_churn():
    """Predict churn for a specific customer"""
    try:
        customer_data = request.get_json()
        
        if not customer_data:
            return jsonify({"error": "No customer data provided"}), 400
        
        prediction = predictor.predict_churn(customer_data)
        
        if "error" in prediction:
            return jsonify(prediction), 500
        
        return jsonify(prediction)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get recent churn alerts"""
    try:
        # Mock alerts data - replace with database query
        alerts = []
        for i in range(10):
            alerts.append({
                "id": f"alert-{i+1}",
                "customer_id": f"CUST-{i+1:03d}",
                "risk_score": np.random.uniform(0.6, 0.95),
                "timestamp": (datetime.utcnow() - timedelta(hours=i)).isoformat(),
                "reason": f"High churn risk detected - {np.random.choice(['low engagement', 'payment issues', 'support escalation', 'long inactivity'])}",
                "status": np.random.choice(['new', 'in_progress', 'resolved'])
            })
        
        return jsonify({"alerts": alerts})
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Mock stats - replace with actual calculations
        stats = {
            "total_customers": 12543,
            "churn_rate": 12.5,
            "high_risk_customers": 1567,
            "revenue_at_risk": 234500,
            "alerts_today": 23,
            "resolved_alerts": 18
        }
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    model_path = os.getenv('MODEL_PATH', 'models/churn_model.pkl')
    predictor.load_model(model_path)
    
    # Run the app
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
