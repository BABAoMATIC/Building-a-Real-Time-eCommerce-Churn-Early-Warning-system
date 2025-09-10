#!/usr/bin/env python3
"""
Test script for Socket.IO real-time functionality
"""

import socketio
import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

class SocketIOTester:
    def __init__(self):
        self.sio = socketio.Client()
        self.token = None
        self.connected = False
        self.received_data = []
        
        # Set up event handlers
        self.setup_handlers()
    
    def setup_handlers(self):
        """Set up Socket.IO event handlers"""
        
        @self.sio.event
        def connect():
            print("✅ Connected to Socket.IO server")
            self.connected = True
        
        @self.sio.event
        def connected(data):
            if data.get('status') == 'success':
                print("✅ Socket.IO authentication successful")
            else:
                print(f"❌ Socket.IO authentication failed: {data.get('message')}")
        
        @self.sio.event
        def disconnect():
            print("❌ Disconnected from Socket.IO server")
            self.connected = False
        
        @self.sio.event
        def dashboard_update(data):
            print("📊 Received dashboard update:")
            print(f"   User ID: {data.get('user_id')}")
            print(f"   Timestamp: {data.get('timestamp')}")
            print(f"   Total Predictions: {data.get('metrics', {}).get('total_predictions', 0)}")
            print(f"   Avg Churn Score: {data.get('metrics', {}).get('avg_churn_score', 0)}")
            print(f"   High Risk: {data.get('metrics', {}).get('high_risk_predictions', 0)}")
            self.received_data.append(data)
        
        @self.sio.event
        def system_alert(data):
            print("🚨 Received system alert:")
            print(f"   Alert: {json.dumps(data, indent=2)}")
        
        @self.sio.event
        def new_prediction(data):
            print("🆕 Received new prediction:")
            print(f"   Prediction: {json.dumps(data, indent=2)}")
        
        @self.sio.event
        def error(data):
            print(f"❌ Socket.IO error: {data.get('message', 'Unknown error')}")
    
    def login(self):
        """Login to get authentication token"""
        print("🔐 Logging in...")
        
        login_data = {
            "email": "test@example.com",
            "password": "TestPassword123"
        }
        
        try:
            response = requests.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                self.token = response.json().get('access_token')
                print("✅ Login successful")
                return True
            else:
                print(f"❌ Login failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def connect_socket(self):
        """Connect to Socket.IO server"""
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        print("🔌 Connecting to Socket.IO server...")
        
        try:
            self.sio.connect(
                BASE_URL,
                auth={'token': self.token},
                transports=['websocket', 'polling']
            )
            return True
        except Exception as e:
            print(f"❌ Socket.IO connection error: {e}")
            return False
    
    def request_dashboard_data(self):
        """Request dashboard data"""
        if not self.connected:
            print("❌ Not connected to Socket.IO")
            return
        
        print("📊 Requesting dashboard data...")
        self.sio.emit('request_dashboard_data')
    
    def send_user_action(self, action, data=None):
        """Send user action"""
        if not self.connected:
            print("❌ Not connected to Socket.IO")
            return
        
        print(f"🎯 Sending user action: {action}")
        self.sio.emit('user_action', {
            'action': action,
            'data': data,
            'timestamp': time.time()
        })
    
    def test_live_data_api(self):
        """Test the live data API endpoint"""
        print("\n🌐 Testing live data API endpoint...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(f"{API_BASE}/live-data", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print("✅ Live data API working")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return True
            else:
                print(f"❌ Live data API failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Live data API error: {e}")
            return False
    
    def run_interactive_test(self):
        """Run interactive test session"""
        print("\n🎮 Interactive Socket.IO Test")
        print("Commands:")
        print("  'data' - Request dashboard data")
        print("  'action <action_name>' - Send user action")
        print("  'api' - Test live data API")
        print("  'status' - Show connection status")
        print("  'quit' - Exit test")
        
        while self.connected:
            try:
                command = input("\n> ").strip().lower()
                
                if command == 'quit':
                    break
                elif command == 'data':
                    self.request_dashboard_data()
                elif command.startswith('action '):
                    action = command[7:]
                    self.send_user_action(action)
                elif command == 'api':
                    self.test_live_data_api()
                elif command == 'status':
                    print(f"Connection status: {'Connected' if self.connected else 'Disconnected'}")
                    print(f"Received {len(self.received_data)} dashboard updates")
                else:
                    print("Unknown command. Type 'quit' to exit.")
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")
    
    def cleanup(self):
        """Clean up connections"""
        if self.connected:
            self.sio.disconnect()
        print("🧹 Cleanup completed")

def main():
    """Main test function"""
    print("=" * 60)
    print("Socket.IO Real-Time Dashboard Test")
    print("=" * 60)
    
    tester = SocketIOTester()
    
    try:
        # Step 1: Login
        if not tester.login():
            print("\n❌ Login failed, cannot proceed with Socket.IO test")
            sys.exit(1)
        
        # Step 2: Connect to Socket.IO
        if not tester.connect_socket():
            print("\n❌ Socket.IO connection failed")
            sys.exit(1)
        
        # Step 3: Test live data API
        tester.test_live_data_api()
        
        # Step 4: Request initial dashboard data
        time.sleep(1)  # Wait for connection to stabilize
        tester.request_dashboard_data()
        
        # Step 5: Wait for data
        print("\n⏳ Waiting for dashboard data...")
        time.sleep(3)
        
        if tester.received_data:
            print(f"✅ Received {len(tester.received_data)} dashboard updates")
        else:
            print("⚠️  No dashboard data received")
        
        # Step 6: Test user actions
        print("\n🎯 Testing user actions...")
        tester.send_user_action('filter', {'type': 'high_risk'})
        tester.send_user_action('date_range', {'start': '2024-01-01', 'end': '2024-12-31'})
        
        # Step 7: Interactive test
        tester.run_interactive_test()
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
    finally:
        tester.cleanup()
    
    print("\n" + "=" * 60)
    print("Socket.IO test completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
