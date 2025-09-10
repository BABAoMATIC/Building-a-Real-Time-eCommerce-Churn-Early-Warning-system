"""
User-specific routes for profile and data management
"""

from flask import Blueprint, request, jsonify
from auth.jwt_utils import token_required
from models.user import User
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json

load_dotenv()

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

# Create blueprint
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_user_profile():
    """Get comprehensive user profile with churn predictions"""
    try:
        user = request.current_user
        db = SessionLocal()
        
        try:
            # Get user's churn predictions from the global predictions list
            # In a real application, you'd query the database for user-specific predictions
            from app import churn_predictions
            
            # Filter predictions for this user (if user_id exists in predictions)
            user_predictions = []
            for prediction in churn_predictions:
                # Check if prediction belongs to this user
                if (prediction.get('user_id') == str(user.id) or 
                    prediction.get('user_id') == f"user_{user.id}" or
                    prediction.get('user_id') == user.email):
                    user_predictions.append(prediction)
            
            # Calculate user statistics
            total_predictions = len(user_predictions)
            avg_churn_score = 0
            high_risk_predictions = 0
            recent_predictions = []
            
            if user_predictions:
                # Calculate average churn score
                scores = [p.get('churn_score', 0) for p in user_predictions]
                avg_churn_score = sum(scores) / len(scores) if scores else 0
                
                # Count high-risk predictions (score > 0.7)
                high_risk_predictions = len([p for p in user_predictions if p.get('churn_score', 0) > 0.7])
                
                # Get recent predictions (last 10)
                recent_predictions = sorted(
                    user_predictions, 
                    key=lambda x: x.get('timestamp', ''), 
                    reverse=True
                )[:10]
            
            # Get user activity summary
            activity_summary = {
                'total_predictions': total_predictions,
                'avg_churn_score': round(avg_churn_score, 3),
                'high_risk_predictions': high_risk_predictions,
                'last_activity': user.last_login.isoformat() if user.last_login else None,
                'account_age_days': (datetime.utcnow() - user.created_at).days if user.created_at else 0
            }
            
            # Prepare comprehensive profile data
            profile_data = {
                'user': user.to_dict(),
                'activity_summary': activity_summary,
                'recent_predictions': recent_predictions,
                'churn_insights': {
                    'risk_level': 'high' if avg_churn_score > 0.7 else 'medium' if avg_churn_score > 0.4 else 'low',
                    'trend': 'increasing' if high_risk_predictions > total_predictions * 0.5 else 'stable',
                    'recommendations': generate_recommendations(avg_churn_score, high_risk_predictions, total_predictions)
                }
            }
            
            return jsonify({
                'success': True,
                'data': profile_data,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch user profile: {str(e)}'
        }), 500

@user_bp.route('/predictions', methods=['GET'])
@token_required
def get_user_predictions():
    """Get user's churn predictions"""
    try:
        user = request.current_user
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        # Get user's predictions from global list
        from app import churn_predictions
        
        # Filter predictions for this user
        user_predictions = []
        for prediction in churn_predictions:
            if (prediction.get('user_id') == str(user.id) or 
                prediction.get('user_id') == f"user_{user.id}" or
                prediction.get('user_id') == user.email):
                user_predictions.append(prediction)
        
        # Sort by timestamp (newest first)
        user_predictions.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_predictions = user_predictions[start_idx:end_idx]
        
        return jsonify({
            'success': True,
            'data': {
                'predictions': paginated_predictions,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': len(user_predictions),
                    'pages': (len(user_predictions) + limit - 1) // limit
                }
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch user predictions: {str(e)}'
        }), 500

@user_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats():
    """Get user statistics and insights"""
    try:
        user = request.current_user
        
        # Get user's predictions
        from app import churn_predictions
        
        user_predictions = []
        for prediction in churn_predictions:
            if (prediction.get('user_id') == str(user.id) or 
                prediction.get('user_id') == f"user_{user.id}" or
                prediction.get('user_id') == user.email):
                user_predictions.append(prediction)
        
        # Calculate statistics
        if user_predictions:
            scores = [p.get('churn_score', 0) for p in user_predictions]
            avg_score = sum(scores) / len(scores)
            max_score = max(scores)
            min_score = min(scores)
            
            # Risk distribution
            low_risk = len([s for s in scores if s < 0.4])
            medium_risk = len([s for s in scores if 0.4 <= s < 0.7])
            high_risk = len([s for s in scores if s >= 0.7])
            
            stats = {
                'total_predictions': len(user_predictions),
                'avg_churn_score': round(avg_score, 3),
                'max_churn_score': round(max_score, 3),
                'min_churn_score': round(min_score, 3),
                'risk_distribution': {
                    'low': low_risk,
                    'medium': medium_risk,
                    'high': high_risk
                },
                'trend_analysis': analyze_trend(user_predictions)
            }
        else:
            stats = {
                'total_predictions': 0,
                'avg_churn_score': 0,
                'max_churn_score': 0,
                'min_churn_score': 0,
                'risk_distribution': {
                    'low': 0,
                    'medium': 0,
                    'high': 0
                },
                'trend_analysis': {
                    'trend': 'stable',
                    'change_percentage': 0
                }
            }
        
        return jsonify({
            'success': True,
            'data': stats,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch user stats: {str(e)}'
        }), 500

def generate_recommendations(avg_score, high_risk_count, total_predictions):
    """Generate personalized recommendations based on user's churn data"""
    recommendations = []
    
    if avg_score > 0.7:
        recommendations.extend([
            "High churn risk detected. Consider immediate customer retention strategies.",
            "Review recent customer interactions and feedback.",
            "Implement targeted retention campaigns for high-risk segments."
        ])
    elif avg_score > 0.4:
        recommendations.extend([
            "Medium churn risk. Monitor customer engagement closely.",
            "Consider proactive outreach to at-risk customers.",
            "Analyze patterns in customer behavior data."
        ])
    else:
        recommendations.extend([
            "Low churn risk. Continue current customer satisfaction strategies.",
            "Focus on customer growth and expansion opportunities.",
            "Maintain regular customer feedback collection."
        ])
    
    if high_risk_count > total_predictions * 0.3:
        recommendations.append("High number of risky predictions. Consider reviewing your customer segmentation strategy.")
    
    return recommendations

@user_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_user_profile():
    """Update user profile information"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        db = SessionLocal()
        try:
            # Get the user from database
            db_user = db.query(User).filter(User.id == user.id).first()
            if not db_user:
                return jsonify({
                    'success': False,
                    'error': 'User not found'
                }), 404
            
            # Validate and update fields
            updated_fields = []
            
            # Update name
            if 'name' in data and data['name']:
                name = data['name'].strip()
                if len(name) < 2:
                    return jsonify({
                        'success': False,
                        'error': 'Name must be at least 2 characters long'
                    }), 400
                db_user.name = name
                updated_fields.append('name')
            
            # Update email
            if 'email' in data and data['email']:
                email = data['email'].strip().lower()
                if not validate_email_format(email):
                    return jsonify({
                        'success': False,
                        'error': 'Invalid email format'
                    }), 400
                
                # Check if email is already taken by another user
                existing_user = db.query(User).filter(
                    User.email == email,
                    User.id != user.id
                ).first()
                if existing_user:
                    return jsonify({
                        'success': False,
                        'error': 'Email is already taken by another user'
                    }), 400
                
                db_user.email = email
                updated_fields.append('email')
            
            # Update password
            if 'password' in data and data['password']:
                password = data['password']
                if not validate_password_strength(password):
                    return jsonify({
                        'success': False,
                        'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
                    }), 400
                
                db_user.password_hash = db_user.hash_password(password)
                updated_fields.append('password')
            
            # Update company (optional)
            if 'company' in data:
                company = data['company'].strip() if data['company'] else None
                db_user.company = company
                updated_fields.append('company')
            
            if not updated_fields:
                return jsonify({
                    'success': False,
                    'error': 'No valid fields to update'
                }), 400
            
            # Update timestamp
            db_user.updated_at = datetime.utcnow()
            
            # Commit changes
            db.commit()
            db.refresh(db_user)
            
            return jsonify({
                'success': True,
                'message': f'Profile updated successfully. Updated fields: {", ".join(updated_fields)}',
                'user': db_user.to_dict(),
                'updated_fields': updated_fields
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to update profile: {str(e)}'
        }), 500

def validate_email_format(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """Validate password strength"""
    import re
    if len(password) < 8:
        return False
    
    if not re.search(r'[A-Z]', password):
        return False
    
    if not re.search(r'[a-z]', password):
        return False
    
    if not re.search(r'\d', password):
        return False
    
    return True

def analyze_trend(predictions):
    """Analyze trend in user's churn predictions"""
    if len(predictions) < 2:
        return {'trend': 'stable', 'change_percentage': 0}
    
    # Sort by timestamp
    sorted_predictions = sorted(predictions, key=lambda x: x.get('timestamp', ''))
    
    # Calculate average scores for first and second half
    mid_point = len(sorted_predictions) // 2
    first_half_avg = sum(p.get('churn_score', 0) for p in sorted_predictions[:mid_point]) / mid_point
    second_half_avg = sum(p.get('churn_score', 0) for p in sorted_predictions[mid_point:]) / (len(sorted_predictions) - mid_point)
    
    change_percentage = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
    
    if change_percentage > 10:
        trend = 'increasing'
    elif change_percentage < -10:
        trend = 'decreasing'
    else:
        trend = 'stable'
    
    return {
        'trend': trend,
        'change_percentage': round(change_percentage, 2)
    }
