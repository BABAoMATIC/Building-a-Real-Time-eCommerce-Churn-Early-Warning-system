#!/usr/bin/env python3
"""
Master Validation Script for eCommerce Churn Early-Warning System

This script orchestrates the complete validation of the entire system by:
1. Running backend validation (Python)
2. Running frontend validation (Node.js)
3. Generating a comprehensive report
4. Providing recommendations

Usage:
    python validate_all.py [--backend-only] [--frontend-only] [--skip-unit-tests]

Requirements:
    - subprocess
    - json
    - datetime
"""

import subprocess
import json
import sys
import os
from datetime import datetime
from pathlib import Path

class MasterValidator:
    """Master validator that orchestrates all validation tests"""
    
    def __init__(self):
        self.results = {
            'backend_validation': {'status': 'PENDING', 'output': '', 'errors': []},
            'frontend_validation': {'status': 'PENDING', 'output': '', 'errors': []},
            'overall_status': 'PENDING'
        }
        self.start_time = datetime.now()
        self.project_root = Path(__file__).parent
    
    def run_backend_validation(self) -> bool:
        """Run backend validation using Python script"""
        print("🔍 Running backend validation...")
        
        try:
            backend_dir = self.project_root / 'backend'
            result = subprocess.run(
                [sys.executable, 'validate_system.py'],
                cwd=backend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            self.results['backend_validation']['output'] = result.stdout
            self.results['backend_validation']['errors'] = result.stderr.split('\n') if result.stderr else []
            
            if result.returncode == 0:
                self.results['backend_validation']['status'] = 'PASS'
                print("✅ Backend validation completed successfully")
                return True
            else:
                self.results['backend_validation']['status'] = 'FAIL'
                print("❌ Backend validation failed")
                return False
                
        except subprocess.TimeoutExpired:
            self.results['backend_validation']['status'] = 'FAIL'
            self.results['backend_validation']['errors'] = ['Validation timed out after 5 minutes']
            print("❌ Backend validation timed out")
            return False
        except Exception as e:
            self.results['backend_validation']['status'] = 'FAIL'
            self.results['backend_validation']['errors'] = [str(e)]
            print(f"❌ Backend validation failed with exception: {e}")
            return False
    
    def run_frontend_validation(self) -> bool:
        """Run frontend validation using Node.js script"""
        print("🔍 Running frontend validation...")
        
        try:
            frontend_dir = self.project_root / 'frontend'
            
            # Check if Node.js is available
            node_check = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if node_check.returncode != 0:
                print("❌ Node.js is not available. Skipping frontend validation.")
                self.results['frontend_validation']['status'] = 'SKIP'
                self.results['frontend_validation']['errors'] = ['Node.js not available']
                return True
            
            # Check if validation script exists
            validation_script = frontend_dir / 'validate_frontend.js'
            if not validation_script.exists():
                print("❌ Frontend validation script not found. Skipping frontend validation.")
                self.results['frontend_validation']['status'] = 'SKIP'
                self.results['frontend_validation']['errors'] = ['Validation script not found']
                return True
            
            result = subprocess.run(
                ['node', 'validate_frontend.js'],
                cwd=frontend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            self.results['frontend_validation']['output'] = result.stdout
            self.results['frontend_validation']['errors'] = result.stderr.split('\n') if result.stderr else []
            
            if result.returncode == 0:
                self.results['frontend_validation']['status'] = 'PASS'
                print("✅ Frontend validation completed successfully")
                return True
            else:
                self.results['frontend_validation']['status'] = 'FAIL'
                print("❌ Frontend validation failed")
                return False
                
        except subprocess.TimeoutExpired:
            self.results['frontend_validation']['status'] = 'FAIL'
            self.results['frontend_validation']['errors'] = ['Validation timed out after 5 minutes']
            print("❌ Frontend validation timed out")
            return False
        except Exception as e:
            self.results['frontend_validation']['status'] = 'FAIL'
            self.results['frontend_validation']['errors'] = [str(e)]
            print(f"❌ Frontend validation failed with exception: {e}")
            return False
    
    def check_dependencies(self) -> bool:
        """Check if all required dependencies are installed"""
        print("🔍 Checking dependencies...")
        
        dependencies_ok = True
        
        # Check Python dependencies
        try:
            import requests
            import pymysql
            import kafka
            from dotenv import load_dotenv
            print("✅ Python dependencies are available")
        except ImportError as e:
            print(f"❌ Missing Python dependency: {e}")
            print("   Install with: pip install -r backend/requirements_validation.txt")
            dependencies_ok = False
        
        # Check Node.js dependencies
        try:
            frontend_dir = self.project_root / 'frontend'
            package_json = frontend_dir / 'package.json'
            
            if package_json.exists():
                with open(package_json) as f:
                    package_data = json.load(f)
                
                # Check if puppeteer is installed
                node_modules = frontend_dir / 'node_modules'
                if not node_modules.exists():
                    print("❌ Node.js dependencies not installed")
                    print("   Install with: cd frontend && npm install")
                    dependencies_ok = False
                else:
                    print("✅ Node.js dependencies are available")
            else:
                print("⚠️  Frontend package.json not found")
                
        except Exception as e:
            print(f"❌ Error checking Node.js dependencies: {e}")
            dependencies_ok = False
        
        return dependencies_ok
    
    def generate_master_report(self) -> str:
        """Generate comprehensive master validation report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        # Determine overall status
        backend_status = self.results['backend_validation']['status']
        frontend_status = self.results['frontend_validation']['status']
        
        if backend_status == 'PASS' and frontend_status in ['PASS', 'SKIP']:
            self.results['overall_status'] = 'PASS'
        elif backend_status == 'FAIL' or frontend_status == 'FAIL':
            self.results['overall_status'] = 'FAIL'
        else:
            self.results['overall_status'] = 'PENDING'
        
        report = f"""
{'='*80}
eCOMMERCE CHURN EARLY-WARNING SYSTEM - MASTER VALIDATION REPORT
{'='*80}
Validation Date: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}
Duration: {duration.total_seconds():.2f} seconds
Overall Status: {self.results['overall_status']}
{'='*80}

"""
        
        # Backend validation results
        report += f"BACKEND VALIDATION: {backend_status}\n"
        report += f"{'='*40}\n"
        if self.results['backend_validation']['output']:
            # Extract key information from backend output
            backend_output = self.results['backend_validation']['output']
            lines = backend_output.split('\n')
            
            # Find summary section
            in_summary = False
            for line in lines:
                if 'SUMMARY:' in line:
                    in_summary = True
                elif in_summary and line.strip():
                    report += f"{line}\n"
                elif in_summary and not line.strip():
                    break
        
        if self.results['backend_validation']['errors']:
            report += "\nBackend Errors:\n"
            for error in self.results['backend_validation']['errors']:
                if error.strip():
                    report += f"  • {error}\n"
        
        report += "\n"
        
        # Frontend validation results
        report += f"FRONTEND VALIDATION: {frontend_status}\n"
        report += f"{'='*40}\n"
        if self.results['frontend_validation']['output']:
            # Extract key information from frontend output
            frontend_output = self.results['frontend_validation']['output']
            lines = frontend_output.split('\n')
            
            # Find summary section
            in_summary = False
            for line in lines:
                if 'SUMMARY:' in line:
                    in_summary = True
                elif in_summary and line.strip():
                    report += f"{line}\n"
                elif in_summary and not line.strip():
                    break
        
        if self.results['frontend_validation']['errors']:
            report += "\nFrontend Errors:\n"
            for error in self.results['frontend_validation']['errors']:
                if error.strip():
                    report += f"  • {error}\n"
        
        report += "\n"
        
        # Recommendations
        report += f"{'='*80}\n"
        report += "RECOMMENDATIONS:\n"
        report += f"{'='*80}\n"
        
        if self.results['overall_status'] == 'PASS':
            report += "🎉 All validations passed! System is ready for production.\n\n"
            report += "Next steps:\n"
            report += "  • Deploy to production environment\n"
            report += "  • Set up monitoring and alerting\n"
            report += "  • Configure backup strategies\n"
            report += "  • Train operations team\n"
        else:
            report += "❌ Validation failed. Please address the following issues:\n\n"
            
            if backend_status == 'FAIL':
                report += "Backend Issues:\n"
                report += "  • Check Flask API is running\n"
                report += "  • Verify Kafka connectivity\n"
                report += "  • Ensure MySQL database is accessible\n"
                report += "  • Review backend validation report\n\n"
            
            if frontend_status == 'FAIL':
                report += "Frontend Issues:\n"
                report += "  • Check Next.js application is running\n"
                report += "  • Verify API endpoints are accessible\n"
                report += "  • Ensure all dependencies are installed\n"
                report += "  • Review frontend validation report\n\n"
            
            report += "Troubleshooting:\n"
            report += "  • Check system logs for detailed error messages\n"
            report += "  • Verify all services are running\n"
            report += "  • Ensure environment variables are set correctly\n"
            report += "  • Review the validation checklist\n"
        
        report += f"\n{'='*80}\n"
        report += "END OF MASTER REPORT\n"
        report += f"{'='*80}\n"
        
        return report
    
    def run_all_validations(self, backend_only=False, frontend_only=False) -> bool:
        """Run all validations based on parameters"""
        print("🚀 Starting master validation...")
        
        # Check dependencies first
        if not self.check_dependencies():
            print("❌ Dependency check failed. Please install required dependencies.")
            return False
        
        success = True
        
        if not frontend_only:
            if not self.run_backend_validation():
                success = False
        
        if not backend_only:
            if not self.run_frontend_validation():
                success = False
        
        # Generate and display master report
        report = self.generate_master_report()
        print(report)
        
        # Save master report
        with open('master_validation_report.txt', 'w') as f:
            f.write(report)
        
        print("📄 Master validation report saved to master_validation_report.txt")
        
        return success

def main():
    """Main function to run master validation"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Master validation for eCommerce Churn Early-Warning System')
    parser.add_argument('--backend-only', action='store_true', help='Run only backend validation')
    parser.add_argument('--frontend-only', action='store_true', help='Run only frontend validation')
    parser.add_argument('--skip-unit-tests', action='store_true', help='Skip unit tests (not implemented yet)')
    
    args = parser.parse_args()
    
    validator = MasterValidator()
    success = validator.run_all_validations(
        backend_only=args.backend_only,
        frontend_only=args.frontend_only
    )
    
    if success:
        print("🎉 Master validation completed successfully!")
        sys.exit(0)
    else:
        print("❌ Master validation failed. Please check the reports.")
        sys.exit(1)

if __name__ == "__main__":
    main()
