"""
Socket.IO service for real-time dashboard updates
"""

import json
import asyncio
from datetime import datetime, timedelta
from flask_socketio import emit, join_room, leave_room
from auth.jwt_utils import jwt_manager
from models.user import User
from models.prediction import ChurnPrediction
from database import SessionLocal
import random
import threading
import time

class SocketService:
    """Service for managing real-time Socket.IO communications"""
    
    def __init__(self, socketio):
        self.socketio = socketio
        self.connected_users = {}
        self.data_broadcast_active = False
        self.broadcast_thread = None
        
    def authenticate_user(self, token):
        """Authenticate user from JWT token"""
        try:
            payload = jwt_manager.verify_token(token)
            if not payload or payload.get('type') != 'access':
                return None
            
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == payload['user_id']).first()
                return user
            finally:
                db.close()
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
    
    def get_user_dashboard_data(self, user_id):
        """Get user-specific dashboard data"""
        try:
            # Get predictions from database
            db = SessionLocal()
            try:
                # Fetch user's predictions from database
                db_predictions = db.query(ChurnPrediction).filter(
                    ChurnPrediction.user_id == user_id
                ).order_by(ChurnPrediction.created_at.desc()).all()
                
                # Convert to list format
                user_predictions = [pred.to_dict() for pred in db_predictions]
                
            finally:
                db.close()
            
            # Fallback to global predictions if database is empty
            if not user_predictions:
                from app import churn_predictions
                for prediction in churn_predictions:
                    if (prediction.get('user_id') == str(user_id) or 
                        prediction.get('user_id') == f"user_{user_id}"):
                        user_predictions.append(prediction)
            
            # Calculate metrics
            total_predictions = len(user_predictions)
            avg_churn_score = 0
            high_risk_count = 0
            recent_predictions = []
            
            if user_predictions:
                scores = [p.get('churn_score', 0) for p in user_predictions]
                avg_churn_score = sum(scores) / len(scores)
                high_risk_count = len([s for s in scores if s > 0.7])
                recent_predictions = sorted(user_predictions, 
                                         key=lambda x: x.get('timestamp', ''), 
                                         reverse=True)[:5]
            
            # Generate some mock real-time metrics
            current_time = datetime.utcnow()
            
            dashboard_data = {
                'user_id': user_id,
                'timestamp': current_time.isoformat(),
                'metrics': {
                    'total_predictions': total_predictions,
                    'avg_churn_score': round(avg_churn_score, 3),
                    'high_risk_predictions': high_risk_count,
                    'low_risk_predictions': len([s for s in scores if s < 0.4]) if user_predictions else 0,
                    'medium_risk_predictions': len([s for s in scores if 0.4 <= s <= 0.7]) if user_predictions else 0,
                    'engagement_score': round(random.uniform(0.3, 0.9), 3),  # Mock data
                    'retention_rate': round(random.uniform(0.6, 0.95), 3),   # Mock data
                    'active_users_today': random.randint(50, 200),           # Mock data
                    'new_predictions_today': random.randint(0, 10),          # Mock data
                },
                'recent_activity': recent_predictions,
                'trends': {
                    'churn_trend': 'stable' if avg_churn_score < 0.5 else 'increasing',
                    'engagement_trend': random.choice(['increasing', 'stable', 'decreasing']),
                    'retention_trend': random.choice(['increasing', 'stable', 'decreasing'])
                },
                'alerts': self.generate_user_alerts(user_predictions, avg_churn_score)
            }
            
            return dashboard_data
            
        except Exception as e:
            print(f"Error getting user dashboard data: {e}")
            return None
    
    def generate_user_alerts(self, predictions, avg_score):
        """Generate user-specific alerts"""
        alerts = []
        
        if avg_score > 0.8:
            alerts.append({
                'type': 'critical',
                'message': 'High churn risk detected',
                'timestamp': datetime.utcnow().isoformat()
            })
        elif avg_score > 0.6:
            alerts.append({
                'type': 'warning',
                'message': 'Medium churn risk - monitor closely',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        if len(predictions) > 0:
            recent_high_risk = len([p for p in predictions[-5:] if p.get('churn_score', 0) > 0.7])
            if recent_high_risk >= 3:
                alerts.append({
                    'type': 'warning',
                    'message': 'Multiple high-risk predictions in recent activity',
                    'timestamp': datetime.utcnow().isoformat()
                })
        
        return alerts
    
    def start_data_broadcast(self):
        """Start broadcasting real-time data to connected users"""
        if self.data_broadcast_active:
            return
        
        self.data_broadcast_active = True
        self.broadcast_thread = threading.Thread(target=self._broadcast_loop, daemon=True)
        self.broadcast_thread.start()
        print("Real-time data broadcast started")
    
    def stop_data_broadcast(self):
        """Stop broadcasting real-time data"""
        self.data_broadcast_active = False
        if self.broadcast_thread:
            self.broadcast_thread.join()
        print("Real-time data broadcast stopped")
    
    def _broadcast_loop(self):
        """Main broadcast loop for real-time data"""
        while self.data_broadcast_active:
            try:
                # Broadcast to all connected users
                for session_id, user_id in self.connected_users.items():
                    dashboard_data = self.get_user_dashboard_data(user_id)
                    if dashboard_data:
                        self.socketio.emit('dashboard_update', dashboard_data, room=session_id)
                
                # Wait before next broadcast
                time.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                print(f"Error in broadcast loop: {e}")
                time.sleep(5)
    
    def handle_connect(self, auth=None):
        """Handle client connection"""
        try:
            if not auth or not auth.get('token'):
                return False
            
            user = self.authenticate_user(auth['token'])
            if not user:
                return False
            
            # Store user connection
            self.connected_users[request.sid] = user.id
            
            # Join user to their personal room
            join_room(f"user_{user.id}")
            
            # Send initial dashboard data
            dashboard_data = self.get_user_dashboard_data(user.id)
            if dashboard_data:
                emit('dashboard_update', dashboard_data)
            
            print(f"User {user.email} connected to real-time updates")
            return True
            
        except Exception as e:
            print(f"Connection error: {e}")
            return False
    
    def handle_disconnect(self):
        """Handle client disconnection"""
        try:
            if request.sid in self.connected_users:
                user_id = self.connected_users[request.sid]
                del self.connected_users[request.sid]
                leave_room(f"user_{user_id}")
                print(f"User {user_id} disconnected from real-time updates")
        except Exception as e:
            print(f"Disconnection error: {e}")
    
    def handle_request_dashboard_data(self, data):
        """Handle request for dashboard data"""
        try:
            if request.sid in self.connected_users:
                user_id = self.connected_users[request.sid]
                dashboard_data = self.get_user_dashboard_data(user_id)
                if dashboard_data:
                    emit('dashboard_update', dashboard_data)
        except Exception as e:
            print(f"Error handling dashboard data request: {e}")
    
    def handle_user_action(self, data):
        """Handle user actions (like filtering, date range changes)"""
        try:
            if request.sid in self.connected_users:
                user_id = self.connected_users[request.sid]
                
                # Process user action and get updated data
                dashboard_data = self.get_user_dashboard_data(user_id)
                if dashboard_data:
                    # Add action-specific data
                    dashboard_data['action_response'] = {
                        'action': data.get('action'),
                        'timestamp': datetime.utcnow().isoformat(),
                        'status': 'processed'
                    }
                    emit('dashboard_update', dashboard_data)
        except Exception as e:
            print(f"Error handling user action: {e}")
    
    def broadcast_system_alert(self, alert_data):
        """Broadcast system-wide alerts"""
        try:
            self.socketio.emit('system_alert', alert_data, namespace='/')
        except Exception as e:
            print(f"Error broadcasting system alert: {e}")
    
    def broadcast_new_prediction(self, prediction_data):
        """Broadcast new prediction to relevant users"""
        try:
            user_id = prediction_data.get('user_id')
            if user_id:
                self.socketio.emit('new_prediction', prediction_data, room=f"user_{user_id}")
        except Exception as e:
            print(f"Error broadcasting new prediction: {e}")

# Global socket service instance
socket_service = None

def init_socket_service(socketio):
    """Initialize the socket service"""
    global socket_service
    socket_service = SocketService(socketio)
    return socket_service
