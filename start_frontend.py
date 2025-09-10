#!/usr/bin/env python3
"""
ChurnGuard Frontend Startup Script
This script handles all the setup and starts the frontend server
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_node_npm():
    """Check if Node.js and npm are installed"""
    print("🔍 Checking Node.js and npm...")
    
    try:
        # Check Node.js version
        node_version = subprocess.check_output(['node', '--version'], text=True).strip()
        print(f"✅ Node.js: {node_version}")
        
        # Check npm version
        npm_version = subprocess.check_output(['npm', '--version'], text=True).strip()
        print(f"✅ npm: {npm_version}")
        
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js or npm not found. Please install Node.js 18+ and npm.")
        return False

def install_dependencies():
    """Install frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    
    try:
        # Change to frontend directory
        os.chdir("frontend")
        
        # Install dependencies
        subprocess.check_call(['npm', 'install'])
        print("✅ Dependencies installed successfully!")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def build_frontend():
    """Build the frontend for production"""
    print("🔨 Building frontend...")
    
    try:
        # Build the application
        subprocess.check_call(['npm', 'run', 'build'])
        print("✅ Frontend built successfully!")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        return False

def start_dev_server():
    """Start the development server"""
    print("🚀 Starting ChurnGuard Frontend Development Server...")
    
    try:
        print("✅ Frontend server starting...")
        print("🌐 Frontend: http://localhost:3000")
        print("🛑 Press Ctrl+C to stop")
        
        # Start development server
        subprocess.check_call(['npm', 'run', 'dev'])
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start dev server: {e}")
        return False
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
        return True

def start_prod_server():
    """Start the production server"""
    print("🚀 Starting ChurnGuard Frontend Production Server...")
    
    try:
        # First build the application
        if not build_frontend():
            return False
        
        print("✅ Frontend server starting...")
        print("🌐 Frontend: http://localhost:3000")
        print("🛑 Press Ctrl+C to stop")
        
        # Start production server
        subprocess.check_call(['npm', 'start'])
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start production server: {e}")
        return False
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
        return True

def main():
    """Main function"""
    print("🛡️ ChurnGuard Frontend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("frontend").exists():
        print("❌ Frontend directory not found. Please run from project root.")
        return
    
    # Check Node.js and npm
    if not check_node_npm():
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Ask user for mode
    print("\n🎯 Choose startup mode:")
    print("1. Development mode (npm run dev)")
    print("2. Production mode (npm run build && npm start)")
    
    try:
        choice = input("Enter choice (1 or 2): ").strip()
        
        if choice == "1":
            start_dev_server()
        elif choice == "2":
            start_prod_server()
        else:
            print("❌ Invalid choice. Starting development mode...")
            start_dev_server()
            
    except KeyboardInterrupt:
        print("\n🛑 Startup cancelled")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
