"""
Authentication routes
"""

from flask import Blueprint, request, jsonify
from auth.auth_service import AuthService
from auth.jwt_utils import token_required, admin_required
from models.user import User
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

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
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].strip()
        password = data['password']
        name = data['name'].strip()
        company = data.get('company', '').strip() or None
        role = data.get('role', 'user')
        
        # Register user
        success, message, result = AuthService.register_user(
            email=email,
            password=password,
            name=name,
            company=company,
            role=role
        )
        
        if success:
            return jsonify({
                'message': message,
                'user': result.to_dict()
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].strip()
        password = data['password']
        
        # Authenticate user
        success, message, result = AuthService.login_user(email, password)
        
        if success:
            return jsonify({
                'message': message,
                'access_token': result['access_token'],
                'refresh_token': result['refresh_token'],
                'user': result['user']
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    try:
        data = request.get_json()
        
        if not data.get('refresh_token'):
            return jsonify({'error': 'Refresh token is required'}), 400
        
        refresh_token = data['refresh_token']
        
        # Refresh token
        success, message, result = AuthService.refresh_token(refresh_token)
        
        if success:
            return jsonify({
                'message': message,
                'access_token': result['access_token'],
                'user': result['user']
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        user = request.current_user
        return jsonify({
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    try:
        user = request.current_user
        data = request.get_json()
        
        name = data.get('name')
        company = data.get('company')
        preferences = data.get('preferences')
        
        # Update profile
        success, message, updated_user = AuthService.update_user_profile(
            user_id=user.id,
            name=name,
            company=company,
            preferences=preferences
        )
        
        if success:
            return jsonify({
                'message': message,
                'user': updated_user.to_dict()
            }), 200
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': f'Profile update failed: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Validate required fields
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Change password
        success, message = AuthService.change_password(
            user_id=user.id,
            current_password=current_password,
            new_password=new_password
        )
        
        if success:
            return jsonify({'message': message}), 200
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': f'Password change failed: {str(e)}'}), 500

@auth_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users():
    """Get all users (admin only)"""
    try:
        db = SessionLocal()
        try:
            users = db.query(User).all()
            return jsonify({
                'users': [user.to_dict() for user in users]
            }), 200
        finally:
            db.close()
    except Exception as e:
        return jsonify({'error': f'Failed to get users: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token():
    """Verify token and return user info"""
    try:
        user = request.current_user
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Token verification failed: {str(e)}'}), 500
