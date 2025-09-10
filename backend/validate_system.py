#!/usr/bin/env python3
"""
eCommerce Churn Early-Warning System Validation Script

This script validates the entire system by checking:
1. Environment variables and services
2. Backend Flask API functionality
3. Kafka producer and consumer
4. MySQL database connectivity and data
5. End-to-end data flow
6. Error handling scenarios

Usage:
    python validate_system.py

Requirements:
    - requests
    - pymysql
    - kafka-python
    - python-dotenv
    - docker
"""

import os
import sys
import json
import time
import logging
import subprocess
import requests
import pymysql
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('system_validation.log')
    ]
)
logger = logging.getLogger(__name__)

class SystemValidator:
    """Comprehensive system validation for the eCommerce Churn Early-Warning System"""
    
    def __init__(self):
        """Initialize the validator with configuration"""
        self.results = {
            'environment_check': {'status': 'PENDING', 'details': []},
            'backend_test': {'status': 'PENDING', 'details': []},
            'kafka_test': {'status': 'PENDING', 'details': []},
            'database_test': {'status': 'PENDING', 'details': []},
            'frontend_test': {'status': 'PENDING', 'details': []},
            'e2e_test': {'status': 'PENDING', 'details': []},
            'error_handling': {'status': 'PENDING', 'details': []}
        }
        
        # Configuration from environment variables
        self.config = {
            'flask_url': os.getenv('FLASK_API_URL', 'http://localhost:5000'),
            'kafka_servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
            'kafka_topic': os.getenv('KAFKA_TOPIC', 'user-events'),
            'db_host': os.getenv('DB_HOST', 'localhost'),
            'db_port': int(os.getenv('DB_PORT', '3306')),
            'db_name': os.getenv('DB_NAME', 'churn_db'),
            'db_user': os.getenv('DB_USER', 'root'),
            'db_password': os.getenv('DB_PASSWORD', 'password'),
            'frontend_url': os.getenv('FRONTEND_URL', 'http://localhost:3000')
        }
        
        self.start_time = datetime.now()
    
    def log_result(self, test_name: str, status: str, message: str, details: Any = None):
        """Log test result"""
        self.results[test_name]['status'] = status
        self.results[test_name]['details'].append({
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'details': details
        })
        
        status_emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏳"
        logger.info(f"{status_emoji} {test_name}: {message}")
    
    def check_environment_variables(self) -> bool:
        """Check if all required environment variables are set"""
        logger.info("🔍 Checking environment variables...")
        
        required_vars = [
            'FLASK_API_URL', 'KAFKA_BOOTSTRAP_SERVERS', 'KAFKA_TOPIC',
            'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            self.log_result('environment_check', 'FAIL', 
                          f"Missing environment variables: {', '.join(missing_vars)}")
            return False
        
        self.log_result('environment_check', 'PASS', 
                       "All required environment variables are set")
        return True
    
    def check_services_running(self) -> bool:
        """Check if required services are running"""
        logger.info("🔍 Checking if services are running...")
        
        services_status = {}
        
        # Check MySQL
        try:
            conn = pymysql.connect(
                host=self.config['db_host'],
                port=self.config['db_port'],
                user=self.config['db_user'],
                password=self.config['db_password'],
                database=self.config['db_name']
            )
            conn.close()
            services_status['MySQL'] = True
            self.log_result('environment_check', 'PASS', "MySQL is running and accessible")
        except Exception as e:
            services_status['MySQL'] = False
            self.log_result('environment_check', 'FAIL', f"MySQL connection failed: {e}")
        
        # Check Kafka
        try:
            producer = KafkaProducer(
                bootstrap_servers=self.config['kafka_servers'],
                api_version=(0, 10, 1)
            )
            metadata = producer.partitions_for(self.config['kafka_topic'])
            producer.close()
            services_status['Kafka'] = True
            self.log_result('environment_check', 'PASS', f"Kafka is running, topic has {len(metadata)} partitions")
        except Exception as e:
            services_status['Kafka'] = False
            self.log_result('environment_check', 'FAIL', f"Kafka connection failed: {e}")
        
        # Check Flask API
        try:
            response = requests.get(f"{self.config['flask_url']}/health", timeout=5)
            if response.status_code == 200:
                services_status['Flask API'] = True
                self.log_result('environment_check', 'PASS', "Flask API is running")
            else:
                services_status['Flask API'] = False
                self.log_result('environment_check', 'FAIL', f"Flask API returned status {response.status_code}")
        except Exception as e:
            services_status['Flask API'] = False
            self.log_result('environment_check', 'FAIL', f"Flask API connection failed: {e}")
        
        # Check Docker services
        try:
            result = subprocess.run(['docker', 'ps', '--format', 'table {{.Names}}\t{{.Status}}'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                docker_services = result.stdout
                services_status['Docker'] = True
                self.log_result('environment_check', 'PASS', f"Docker is running. Services:\n{docker_services}")
            else:
                services_status['Docker'] = False
                self.log_result('environment_check', 'FAIL', "Docker is not running or accessible")
        except Exception as e:
            services_status['Docker'] = False
            self.log_result('environment_check', 'FAIL', f"Docker check failed: {e}")
        
        return all(services_status.values())
    
    def test_flask_api(self) -> bool:
        """Test Flask API endpoints"""
        logger.info("🔍 Testing Flask API...")
        
        # Test data
        test_events = [
            {
                "user_id": 999,
                "event_type": "bounce",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "metadata": {"product_id": 1, "session_length": 5.0}
            },
            {
                "user_id": 998,
                "event_type": "checkout",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "metadata": {"product_id": 2, "session_length": 15.0}
            },
            {
                "user_id": 997,
                "event_type": "product_view",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "metadata": {"product_id": 3, "session_length": 2.0}
            }
        ]
        
        api_tests_passed = 0
        total_tests = len(test_events)
        
        for i, event in enumerate(test_events):
            try:
                response = requests.post(
                    f"{self.config['flask_url']}/predict-churn",
                    json=event,
                    timeout=10,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    churn_score = data.get('churn_score')
                    
                    if churn_score is not None and isinstance(churn_score, (int, float)) and 0 <= churn_score <= 1:
                        api_tests_passed += 1
                        self.log_result('backend_test', 'PASS', 
                                      f"Test {i+1}: Valid churn_score {churn_score} for {event['event_type']}")
                    else:
                        self.log_result('backend_test', 'FAIL', 
                                      f"Test {i+1}: Invalid churn_score {churn_score}")
                else:
                    self.log_result('backend_test', 'FAIL', 
                                  f"Test {i+1}: HTTP {response.status_code} - {response.text}")
                    
            except Exception as e:
                self.log_result('backend_test', 'FAIL', f"Test {i+1}: Exception - {e}")
        
        if api_tests_passed == total_tests:
            self.log_result('backend_test', 'PASS', 
                          f"All {total_tests} API tests passed")
            return True
        else:
            self.log_result('backend_test', 'FAIL', 
                          f"Only {api_tests_passed}/{total_tests} API tests passed")
            return False
    
    def test_kafka_producer_consumer(self) -> bool:
        """Test Kafka producer and consumer functionality"""
        logger.info("🔍 Testing Kafka producer and consumer...")
        
        try:
            # Test producer
            producer = KafkaProducer(
                bootstrap_servers=self.config['kafka_servers'],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                api_version=(0, 10, 1)
            )
            
            # Send test event
            test_event = {
                "user_id": 888,
                "event_type": "test_event",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "metadata": {"product_id": 100, "session_length": 10.0}
            }
            
            future = producer.send(self.config['kafka_topic'], value=test_event)
            record_metadata = future.get(timeout=10)
            
            self.log_result('kafka_test', 'PASS', 
                          f"Producer sent event to partition {record_metadata.partition}, offset {record_metadata.offset}")
            
            producer.close()
            
            # Test consumer
            consumer = KafkaConsumer(
                self.config['kafka_topic'],
                bootstrap_servers=self.config['kafka_servers'],
                group_id='validation-test-group',
                auto_offset_reset='latest',
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                consumer_timeout_ms=5000,
                api_version=(0, 10, 1)
            )
            
            # Try to consume a message
            message_count = 0
            for message in consumer:
                message_count += 1
                if message_count >= 1:  # Just check if we can consume
                    self.log_result('kafka_test', 'PASS', 
                                  f"Consumer received message: {message.value}")
                    break
            
            consumer.close()
            
            if message_count > 0:
                self.log_result('kafka_test', 'PASS', "Kafka producer and consumer working correctly")
                return True
            else:
                self.log_result('kafka_test', 'FAIL', "Consumer did not receive any messages")
                return False
                
        except Exception as e:
            self.log_result('kafka_test', 'FAIL', f"Kafka test failed: {e}")
            return False
    
    def test_database(self) -> bool:
        """Test MySQL database connectivity and data"""
        logger.info("🔍 Testing MySQL database...")
        
        try:
            # Connect to database
            conn = pymysql.connect(
                host=self.config['db_host'],
                port=self.config['db_port'],
                user=self.config['db_user'],
                password=self.config['db_password'],
                database=self.config['db_name']
            )
            
            cursor = conn.cursor()
            
            # Check if required tables exist
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
            required_tables = ['user_events', 'users', 'events', 'churn_scores']
            existing_tables = [table for table in required_tables if table in tables]
            
            if existing_tables:
                self.log_result('database_test', 'PASS', 
                              f"Found tables: {', '.join(existing_tables)}")
            else:
                self.log_result('database_test', 'FAIL', 
                              f"No required tables found. Available: {', '.join(tables)}")
                return False
            
            # Check for recent data in user_events table
            if 'user_events' in tables:
                cursor.execute("""
                    SELECT COUNT(*) as count, 
                           MAX(created_at) as latest_event,
                           AVG(churn_score) as avg_churn_score
                    FROM user_events 
                    WHERE created_at >= %s
                """, (datetime.now() - timedelta(hours=1),))
                
                result = cursor.fetchone()
                count, latest_event, avg_churn_score = result
                
                if count > 0:
                    self.log_result('database_test', 'PASS', 
                                  f"Found {count} recent events, latest: {latest_event}, avg churn: {avg_churn_score:.3f}")
                else:
                    self.log_result('database_test', 'FAIL', 
                                  "No recent events found in user_events table")
                    return False
            
            # Check for users data
            if 'users' in tables:
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                self.log_result('database_test', 'PASS', f"Found {user_count} users in database")
            
            cursor.close()
            conn.close()
            
            self.log_result('database_test', 'PASS', "Database connectivity and data validation successful")
            return True
            
        except Exception as e:
            self.log_result('database_test', 'FAIL', f"Database test failed: {e}")
            return False
    
    def test_frontend_connectivity(self) -> bool:
        """Test frontend connectivity and basic functionality"""
        logger.info("🔍 Testing frontend connectivity...")
        
        try:
            # Test if frontend is accessible
            response = requests.get(f"{self.config['frontend_url']}/dashboard", timeout=10)
            
            if response.status_code == 200:
                self.log_result('frontend_test', 'PASS', "Frontend dashboard is accessible")
                
                # Check if the response contains expected content
                content = response.text
                if 'churn' in content.lower() or 'dashboard' in content.lower():
                    self.log_result('frontend_test', 'PASS', "Dashboard content appears correct")
                    return True
                else:
                    self.log_result('frontend_test', 'FAIL', "Dashboard content seems incorrect")
                    return False
            else:
                self.log_result('frontend_test', 'FAIL', f"Frontend returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result('frontend_test', 'FAIL', f"Frontend connectivity test failed: {e}")
            return False
    
    def test_end_to_end_flow(self) -> bool:
        """Test complete end-to-end data flow"""
        logger.info("🔍 Testing end-to-end data flow...")
        
        try:
            # Send event through Kafka
            producer = KafkaProducer(
                bootstrap_servers=self.config['kafka_servers'],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                api_version=(0, 10, 1)
            )
            
            e2e_test_event = {
                "user_id": 777,
                "event_type": "e2e_test",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "metadata": {"product_id": 777, "session_length": 5.0}
            }
            
            # Send event
            future = producer.send(self.config['kafka_topic'], value=e2e_test_event)
            record_metadata = future.get(timeout=10)
            
            self.log_result('e2e_test', 'PASS', 
                          f"Event sent to Kafka: partition {record_metadata.partition}, offset {record_metadata.offset}")
            
            producer.close()
            
            # Wait for processing
            time.sleep(5)
            
            # Check if event was processed and stored in database
            conn = pymysql.connect(
                host=self.config['db_host'],
                port=self.config['db_port'],
                user=self.config['db_user'],
                password=self.config['db_password'],
                database=self.config['db_name']
            )
            
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, event_type, churn_score, created_at 
                FROM user_events 
                WHERE user_id = %s AND event_type = %s
                ORDER BY created_at DESC 
                LIMIT 1
            """, (777, 'e2e_test'))
            
            result = cursor.fetchone()
            
            if result:
                user_id, event_type, churn_score, created_at = result
                self.log_result('e2e_test', 'PASS', 
                              f"Event processed and stored: user_id={user_id}, churn_score={churn_score}")
                cursor.close()
                conn.close()
                return True
            else:
                self.log_result('e2e_test', 'FAIL', "Event was not processed and stored in database")
                cursor.close()
                conn.close()
                return False
                
        except Exception as e:
            self.log_result('e2e_test', 'FAIL', f"End-to-end test failed: {e}")
            return False
    
    def test_error_handling(self) -> bool:
        """Test error handling scenarios"""
        logger.info("🔍 Testing error handling...")
        
        error_tests_passed = 0
        total_error_tests = 3
        
        # Test 1: Invalid API request
        try:
            response = requests.post(
                f"{self.config['flask_url']}/predict-churn",
                json={"invalid": "data"},
                timeout=5
            )
            
            if response.status_code != 200:
                error_tests_passed += 1
                self.log_result('error_handling', 'PASS', 
                              f"API correctly rejected invalid request with status {response.status_code}")
            else:
                self.log_result('error_handling', 'FAIL', 
                              "API should have rejected invalid request")
        except Exception as e:
            error_tests_passed += 1
            self.log_result('error_handling', 'PASS', 
                          f"API correctly handled invalid request with exception: {e}")
        
        # Test 2: Database connection with wrong credentials
        try:
            conn = pymysql.connect(
                host=self.config['db_host'],
                port=self.config['db_port'],
                user='wrong_user',
                password='wrong_password',
                database=self.config['db_name']
            )
            conn.close()
            self.log_result('error_handling', 'FAIL', 
                          "Database should have rejected wrong credentials")
        except Exception as e:
            error_tests_passed += 1
            self.log_result('error_handling', 'PASS', 
                          f"Database correctly rejected wrong credentials: {e}")
        
        # Test 3: Kafka with wrong topic
        try:
            producer = KafkaProducer(
                bootstrap_servers=self.config['kafka_servers'],
                api_version=(0, 10, 1)
            )
            metadata = producer.partitions_for('non_existent_topic')
            producer.close()
            self.log_result('error_handling', 'FAIL', 
                          "Kafka should have failed for non-existent topic")
        except Exception as e:
            error_tests_passed += 1
            self.log_result('error_handling', 'PASS', 
                          f"Kafka correctly handled non-existent topic: {e}")
        
        if error_tests_passed == total_error_tests:
            self.log_result('error_handling', 'PASS', 
                          f"All {total_error_tests} error handling tests passed")
            return True
        else:
            self.log_result('error_handling', 'FAIL', 
                          f"Only {error_tests_passed}/{total_error_tests} error handling tests passed")
            return False
    
    def run_unit_tests(self) -> bool:
        """Run unit tests for Flask and frontend"""
        logger.info("🔍 Running unit tests...")
        
        # Test Flask unit tests
        try:
            result = subprocess.run(['python', '-m', 'pytest', 'tests/', '-v'], 
                                  capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                self.log_result('unit_tests', 'PASS', "Flask unit tests passed")
                flask_tests_passed = True
            else:
                self.log_result('unit_tests', 'FAIL', f"Flask unit tests failed: {result.stderr}")
                flask_tests_passed = False
        except Exception as e:
            self.log_result('unit_tests', 'FAIL', f"Flask unit tests failed to run: {e}")
            flask_tests_passed = False
        
        # Test frontend unit tests (if available)
        try:
            result = subprocess.run(['npm', 'test', '--', '--passWithNoTests'], 
                                  capture_output=True, text=True, timeout=60, cwd='../frontend')
            
            if result.returncode == 0:
                self.log_result('unit_tests', 'PASS', "Frontend unit tests passed")
                frontend_tests_passed = True
            else:
                self.log_result('unit_tests', 'FAIL', f"Frontend unit tests failed: {result.stderr}")
                frontend_tests_passed = False
        except Exception as e:
            self.log_result('unit_tests', 'FAIL', f"Frontend unit tests failed to run: {e}")
            frontend_tests_passed = False
        
        return flask_tests_passed and frontend_tests_passed
    
    def generate_report(self) -> str:
        """Generate comprehensive validation report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        report = f"""
{'='*80}
eCOMMERCE CHURN EARLY-WARNING SYSTEM VALIDATION REPORT
{'='*80}
Validation Date: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}
Duration: {duration.total_seconds():.2f} seconds
{'='*80}

"""
        
        # Summary
        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results.values() if result['status'] == 'PASS')
        failed_tests = sum(1 for result in self.results.values() if result['status'] == 'FAIL')
        
        report += f"SUMMARY:\n"
        report += f"Total Tests: {total_tests}\n"
        report += f"Passed: {passed_tests}\n"
        report += f"Failed: {failed_tests}\n"
        report += f"Success Rate: {(passed_tests/total_tests)*100:.1f}%\n\n"
        
        # Detailed results
        for test_name, result in self.results.items():
            status_emoji = "✅" if result['status'] == 'PASS' else "❌" if result['status'] == 'FAIL' else "⏳"
            report += f"{status_emoji} {test_name.upper().replace('_', ' ')}: {result['status']}\n"
            
            for detail in result['details']:
                report += f"   • {detail['message']}\n"
                if detail.get('details'):
                    report += f"     Details: {detail['details']}\n"
            report += "\n"
        
        # Recommendations
        report += f"{'='*80}\n"
        report += "RECOMMENDATIONS:\n"
        report += f"{'='*80}\n"
        
        if failed_tests > 0:
            report += "❌ System validation failed. Please address the following issues:\n"
            for test_name, result in self.results.items():
                if result['status'] == 'FAIL':
                    report += f"   • {test_name.replace('_', ' ').title()}\n"
        else:
            report += "✅ All tests passed! System is ready for production.\n"
        
        report += f"\n{'='*80}\n"
        report += "END OF REPORT\n"
        report += f"{'='*80}\n"
        
        return report
    
    def run_all_tests(self) -> bool:
        """Run all validation tests"""
        logger.info("🚀 Starting comprehensive system validation...")
        
        # Run all tests
        tests = [
            ('Environment Check', self.check_environment_variables),
            ('Services Check', self.check_services_running),
            ('Backend Test', self.test_flask_api),
            ('Kafka Test', self.test_kafka_producer_consumer),
            ('Database Test', self.test_database),
            ('Frontend Test', self.test_frontend_connectivity),
            ('End-to-End Test', self.test_end_to_end_flow),
            ('Error Handling Test', self.test_error_handling),
            ('Unit Tests', self.run_unit_tests)
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                logger.error(f"Test {test_name} failed with exception: {e}")
        
        # Generate and display report
        report = self.generate_report()
        print(report)
        
        # Save report to file
        with open('validation_report.txt', 'w') as f:
            f.write(report)
        
        logger.info("📄 Validation report saved to validation_report.txt")
        
        # Return overall success
        failed_tests = sum(1 for result in self.results.values() if result['status'] == 'FAIL')
        return failed_tests == 0

def main():
    """Main function to run system validation"""
    validator = SystemValidator()
    success = validator.run_all_tests()
    
    if success:
        logger.info("🎉 System validation completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ System validation failed. Please check the report.")
        sys.exit(1)

if __name__ == "__main__":
    main()
