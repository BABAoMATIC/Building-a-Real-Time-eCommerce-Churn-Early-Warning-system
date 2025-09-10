#!/usr/bin/env python3
"""
Simple Flask app for testing authentication without database dependency
"""

import os
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

# Enable CORS
CORS(app)

# In-memory user storage (for testing)
users = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "ChurnGuard API is running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        if email in users:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user_id = len(users) + 1
        hashed_password = generate_password_hash(password)
        
        users[email] = {
            'id': user_id,
            'email': email,
            'name': name,
            'password': hashed_password,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user exists
        if email not in users:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user = users[email]
        
        # Check password
        if not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    """Get user profile"""
    try:
        # Find user by ID
        user = None
        for email, user_data in users.items():
            if user_data['id'] == current_user_id:
                user = user_data
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'created_at': user['created_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/user/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    """Update user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Find user by ID
        user = None
        user_email = None
        for email, user_data in users.items():
            if user_data['id'] == current_user_id:
                user = user_data
                user_email = email
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user data
        if 'name' in data:
            user['name'] = data['name']
        
        if 'email' in data and data['email'] != user['email']:
            # Check if new email already exists
            if data['email'] in users:
                return jsonify({'error': 'Email already exists'}), 400
            
            # Remove old email and add new one
            del users[user_email]
            users[data['email']] = user
            user['email'] = data['email']
        
        if 'password' in data:
            user['password'] = generate_password_hash(data['password'])
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

@app.route('/api/dashboard/metrics', methods=['GET'])
@token_required
def get_dashboard_metrics(current_user_id):
    """Get dashboard metrics"""
    try:
        # Mock data for testing
        metrics = {
            'total_predictions': 1250,
            'avg_churn_score': 0.35,
            'high_risk_predictions': 180,
            'total_users': 5000,
            'churn_rate': 0.12,
            'retention_rate': 0.88
        }
        
        return jsonify({
            'metrics': metrics,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get metrics: {str(e)}'}), 500

@app.route('/api/cohorts', methods=['GET'])
@token_required
def get_cohorts(current_user_id):
    """Get user cohorts"""
    try:
        # Mock data for testing
        cohorts = [
            {
                'id': 1,
                'name': 'High Value Customers',
                'description': 'Customers with high purchase value',
                'criteria': {
                    'engagement_level': 'high',
                    'churn_risk_level': 'low'
                },
                'user_count': 150,
                'created_at': datetime.utcnow().isoformat()
            },
            {
                'id': 2,
                'name': 'At Risk Customers',
                'description': 'Customers showing churn signals',
                'criteria': {
                    'engagement_level': 'low',
                    'churn_risk_level': 'high'
                },
                'user_count': 75,
                'created_at': datetime.utcnow().isoformat()
            }
        ]
        
        return jsonify({
            'cohorts': cohorts,
            'total': len(cohorts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get cohorts: {str(e)}'}), 500

@app.route('/api/upload-data', methods=['POST'])
@token_required
def upload_data(current_user_id):
    """Upload and process data"""
    try:
        # Mock response for testing
        return jsonify({
            'message': 'File uploaded and processed successfully',
            'data': {
                'total_records': 100,
                'predictions_made': 100,
                'high_risk_count': 15,
                'avg_churn_score': 0.25
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting ChurnGuard Simple Test Server...")
    print("📊 Health check: http://localhost:5000/api/health")
    print("🔐 Register: POST http://localhost:5000/api/auth/register")
    print("🔑 Login: POST http://localhost:5000/api/auth/login")
    print("👤 Profile: GET http://localhost:5000/api/user/profile")
    print("🛑 Press Ctrl+C to stop")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
