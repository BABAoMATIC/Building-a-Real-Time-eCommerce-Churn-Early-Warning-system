#!/usr/bin/env python3
"""
ChurnGuard Complete System Startup Script
This script starts both frontend and backend servers
"""

import os
import sys
import subprocess
import time
import threading
import signal
from pathlib import Path

class ChurnGuardStarter:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n🛑 Shutting down ChurnGuard...")
        self.running = False
        self.stop_servers()
        sys.exit(0)
    
    def check_dependencies(self):
        """Check all dependencies"""
        print("🔍 Checking system dependencies...")
        
        # Check Python packages
        python_packages = [
            'flask', 'flask-cors', 'flask-socketio', 'sqlalchemy', 
            'pymysql', 'python-dotenv', 'scikit-learn', 'pandas', 
            'numpy', 'joblib', 'PyJWT', 'bcrypt', 'flask-jwt-extended'
        ]
        
        missing_python = []
        for package in python_packages:
            try:
                __import__(package.replace('-', '_'))
            except ImportError:
                missing_python.append(package)
        
        if missing_python:
            print(f"📦 Installing missing Python packages: {', '.join(missing_python)}")
            try:
                subprocess.check_call([
                    sys.executable, '-m', 'pip', 'install', 
                    '--break-system-packages'
                ] + missing_python)
                print("✅ Python packages installed!")
            except subprocess.CalledProcessError:
                print("❌ Failed to install Python packages")
                return False
        
        # Check Node.js
        try:
            subprocess.check_output(['node', '--version'], text=True)
            subprocess.check_output(['npm', '--version'], text=True)
            print("✅ Node.js and npm are available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Node.js or npm not found. Please install Node.js 18+")
            return False
        
        return True
    
    def setup_environment(self):
        """Setup environment files"""
        print("🔧 Setting up environment...")
        
        # Backend .env
        backend_env = Path("backend/.env")
        if not backend_env.exists():
            backend_env.write_text("""# Database Configuration
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
""")
            print("✅ Backend .env created")
        
        # Frontend .env.local
        frontend_env = Path("frontend/.env.local")
        if not frontend_env.exists():
            frontend_env.write_text("""# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=ChurnGuard
NEXT_PUBLIC_APP_VERSION=1.0.0
""")
            print("✅ Frontend .env.local created")
        
        # Create directories
        Path("backend/uploads").mkdir(exist_ok=True)
        print("✅ Directories created")
    
    def start_backend(self):
        """Start backend server"""
        print("🚀 Starting Backend Server...")
        
        try:
            # Change to backend directory
            os.chdir("backend")
            
            # Start backend
            self.backend_process = subprocess.Popen([
                sys.executable, 'app.py'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait a moment for startup
            time.sleep(3)
            
            # Check if process is still running
            if self.backend_process.poll() is None:
                print("✅ Backend server started on http://localhost:5000")
                return True
            else:
                stdout, stderr = self.backend_process.communicate()
                print(f"❌ Backend failed to start: {stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Backend error: {e}")
            return False
        finally:
            # Return to project root
            os.chdir("..")
    
    def start_frontend(self):
        """Start frontend server"""
        print("🚀 Starting Frontend Server...")
        
        try:
            # Change to frontend directory
            os.chdir("frontend")
            
            # Install dependencies if needed
            if not Path("node_modules").exists():
                print("📦 Installing frontend dependencies...")
                subprocess.check_call(['npm', 'install'])
            
            # Start frontend
            self.frontend_process = subprocess.Popen([
                'npm', 'run', 'dev'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait a moment for startup
            time.sleep(5)
            
            # Check if process is still running
            if self.frontend_process.poll() is None:
                print("✅ Frontend server started on http://localhost:3000")
                return True
            else:
                stdout, stderr = self.frontend_process.communicate()
                print(f"❌ Frontend failed to start: {stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Frontend error: {e}")
            return False
        finally:
            # Return to project root
            os.chdir("..")
    
    def stop_servers(self):
        """Stop all servers"""
        print("🛑 Stopping servers...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            print("✅ Backend stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            print("✅ Frontend stopped")
    
    def monitor_servers(self):
        """Monitor server health"""
        print("📊 Monitoring servers...")
        print("🌐 Frontend: http://localhost:3000")
        print("🔌 Backend: http://localhost:5000")
        print("📊 Health: http://localhost:5000/api/health")
        print("🛑 Press Ctrl+C to stop all servers")
        
        try:
            while self.running:
                time.sleep(1)
                
                # Check backend
                if self.backend_process and self.backend_process.poll() is not None:
                    print("❌ Backend server stopped unexpectedly")
                    break
                
                # Check frontend
                if self.frontend_process and self.frontend_process.poll() is not None:
                    print("❌ Frontend server stopped unexpectedly")
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Shutdown requested")
        finally:
            self.stop_servers()
    
    def run(self):
        """Run the complete system"""
        print("🛡️ ChurnGuard Complete System Startup")
        print("=" * 60)
        
        # Check if we're in the right directory
        if not Path("backend").exists() or not Path("frontend").exists():
            print("❌ Backend or frontend directory not found. Please run from project root.")
            return
        
        # Check dependencies
        if not self.check_dependencies():
            return
        
        # Setup environment
        self.setup_environment()
        
        # Start backend
        if not self.start_backend():
            print("❌ Failed to start backend")
            return
        
        # Start frontend
        if not self.start_frontend():
            print("❌ Failed to start frontend")
            self.stop_servers()
            return
        
        # Monitor servers
        self.monitor_servers()

def main():
    """Main function"""
    starter = ChurnGuardStarter()
    starter.run()

if __name__ == "__main__":
    main()
