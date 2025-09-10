#!/usr/bin/env python3
"""
ChurnGuard Backend Startup Script
This script handles all the setup and starts the backend server
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'flask', 'flask-cors', 'flask-socketio', 'sqlalchemy', 
        'pymysql', 'python-dotenv', 'scikit-learn', 'pandas', 
        'numpy', 'joblib', 'PyJWT', 'bcrypt', 'flask-jwt-extended'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', 
                '--break-system-packages'
            ] + missing_packages)
            print("✅ All packages installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install packages: {e}")
            return False
    
    return True

def setup_environment():
    """Setup environment variables"""
    print("🔧 Setting up environment...")
    
    # Create .env file if it doesn't exist
    env_file = Path("backend/.env")
    if not env_file.exists():
        print("📝 Creating .env file...")
        env_content = """# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=churn_db
DB_USER=root
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Flask Configuration
SECRET_KEY=your-flask-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True

# Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
"""
        env_file.write_text(env_content)
        print("✅ .env file created")
    
    # Create uploads directory
    uploads_dir = Path("backend/uploads")
    uploads_dir.mkdir(exist_ok=True)
    print("✅ Uploads directory ready")

def start_server():
    """Start the Flask server"""
    print("🚀 Starting ChurnGuard Backend Server...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Import and run the app
    try:
        from app import app, socketio
        
        print("✅ Backend server starting...")
        print("📊 Health check: http://localhost:5000/api/health")
        print("🔌 Socket.IO: http://localhost:5000/socket.io/")
        print("🛑 Press Ctrl+C to stop")
        
        # Start the server
        socketio.run(
            app,
            host='0.0.0.0',
            port=5000,
            debug=True,
            allow_unsafe_werkzeug=True
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔧 Trying to fix import issues...")
        
        # Try to run with error handling
        try:
            import app
            print("✅ App imported successfully")
        except Exception as import_error:
            print(f"❌ Import failed: {import_error}")
            return False
    
    except Exception as e:
        print(f"❌ Server error: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🛡️ ChurnGuard Backend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ Backend directory not found. Please run from project root.")
        return
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed")
        return
    
    # Setup environment
    setup_environment()
    
    # Start server
    if not start_server():
        print("❌ Failed to start server")
        return
    
    print("✅ Backend server stopped")

if __name__ == "__main__":
    main()
