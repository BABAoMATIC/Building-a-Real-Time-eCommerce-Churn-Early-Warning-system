#!/usr/bin/env python3
"""
Simple test server to verify the application works without database
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create a simple Flask app for testing
app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "ChurnGuard API is running",
        "version": "1.0.0"
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        "message": "Test endpoint working",
        "timestamp": "2024-01-01T00:00:00Z"
    })

if __name__ == '__main__':
    print("🚀 Starting ChurnGuard Test Server...")
    print("📊 Health check: http://localhost:5000/api/health")
    print("🧪 Test endpoint: http://localhost:5000/api/test")
    print("🛑 Press Ctrl+C to stop")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
