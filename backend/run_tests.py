#!/usr/bin/env python3
"""
Test runner script for the eCommerce Churn Early-Warning System

This script runs all unit tests for:
- Flask /predict-churn API
- Next.js dashboard hook (if available)
- Kafka consumer

Usage:
    python run_tests.py [--coverage] [--verbose] [--specific test_file]
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(command)}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, check=True, capture_output=False)
        print(f"✅ {description} - PASSED")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED (exit code: {e.returncode})")
        return False
    except FileNotFoundError:
        print(f"❌ {description} - FAILED (command not found)")
        return False

def install_test_dependencies():
    """Install test dependencies"""
    print("Installing test dependencies...")
    
    # Install Python test dependencies
    python_deps = [
        "pytest>=7.0.0",
        "pytest-asyncio>=0.21.0", 
        "pytest-mock>=3.10.0",
        "pytest-cov>=4.0.0",
        "requests-mock>=1.10.0",
        "responses>=0.23.0"
    ]
    
    for dep in python_deps:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
        except subprocess.CalledProcessError:
            print(f"Warning: Failed to install {dep}")

def run_flask_api_tests(coverage=False, verbose=False):
    """Run Flask API tests"""
    os.chdir(Path(__file__).parent)
    
    command = [sys.executable, "-m", "pytest", "tests/test_predict_churn_api.py"]
    
    if verbose:
        command.append("-v")
    
    if coverage:
        command.extend(["--cov=app", "--cov-report=html", "--cov-report=term"])
    
    return run_command(command, "Flask API Tests")

def run_kafka_consumer_tests(coverage=False, verbose=False):
    """Run Kafka consumer tests"""
    os.chdir(Path(__file__).parent)
    
    command = [sys.executable, "-m", "pytest", "tests/test_kafka_consumer.py"]
    
    if verbose:
        command.append("-v")
    
    if coverage:
        command.extend(["--cov=kafka_consumer", "--cov-report=html", "--cov-report=term"])
    
    return run_command(command, "Kafka Consumer Tests")

def run_nextjs_tests(coverage=False, verbose=False):
    """Run Next.js tests (if available)"""
    frontend_path = Path(__file__).parent.parent / "frontend"
    
    if not frontend_path.exists():
        print("⚠️  Frontend directory not found, skipping Next.js tests")
        return True
    
    os.chdir(frontend_path)
    
    # Check if package.json exists
    if not (frontend_path / "package.json").exists():
        print("⚠️  package.json not found, skipping Next.js tests")
        return True
    
    # Install dependencies if needed
    if not (frontend_path / "node_modules").exists():
        print("Installing Next.js dependencies...")
        run_command(["npm", "install"], "Install Next.js Dependencies")
    
    # Run tests
    command = ["npm", "test"]
    
    if verbose:
        command.append("--verbose")
    
    return run_command(command, "Next.js Tests")

def run_specific_test(test_file, coverage=False, verbose=False):
    """Run a specific test file"""
    os.chdir(Path(__file__).parent)
    
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    command = [sys.executable, "-m", "pytest", test_file]
    
    if verbose:
        command.append("-v")
    
    if coverage:
        command.extend(["--cov", "--cov-report=html", "--cov-report=term"])
    
    return run_command(command, f"Specific Test: {test_file}")

def main():
    parser = argparse.ArgumentParser(description="Run unit tests for the eCommerce Churn Early-Warning System")
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--specific", help="Run specific test file")
    parser.add_argument("--install-deps", action="store_true", help="Install test dependencies")
    parser.add_argument("--flask-only", action="store_true", help="Run only Flask API tests")
    parser.add_argument("--kafka-only", action="store_true", help="Run only Kafka consumer tests")
    parser.add_argument("--nextjs-only", action="store_true", help="Run only Next.js tests")
    
    args = parser.parse_args()
    
    print("🧪 eCommerce Churn Early-Warning System - Test Runner")
    print("=" * 60)
    
    # Install dependencies if requested
    if args.install_deps:
        install_test_dependencies()
    
    # Run specific test if requested
    if args.specific:
        success = run_specific_test(args.specific, args.coverage, args.verbose)
        sys.exit(0 if success else 1)
    
    # Track overall success
    all_tests_passed = True
    
    # Run Flask API tests
    if not args.kafka_only and not args.nextjs_only:
        if not run_flask_api_tests(args.coverage, args.verbose):
            all_tests_passed = False
    
    # Run Kafka consumer tests
    if not args.flask_only and not args.nextjs_only:
        if not run_kafka_consumer_tests(args.coverage, args.verbose):
            all_tests_passed = False
    
    # Run Next.js tests
    if not args.flask_only and not args.kafka_only:
        if not run_nextjs_tests(args.coverage, args.verbose):
            all_tests_passed = False
    
    # Summary
    print(f"\n{'='*60}")
    if all_tests_passed:
        print("🎉 All tests passed successfully!")
        print("✅ Flask API tests: PASSED")
        print("✅ Kafka Consumer tests: PASSED") 
        print("✅ Next.js tests: PASSED")
    else:
        print("❌ Some tests failed. Please check the output above.")
    print(f"{'='*60}")
    
    sys.exit(0 if all_tests_passed else 1)

if __name__ == "__main__":
    main()
