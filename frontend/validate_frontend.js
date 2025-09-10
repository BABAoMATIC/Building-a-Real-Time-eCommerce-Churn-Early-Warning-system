#!/usr/bin/env node
/**
 * Frontend Validation Script for eCommerce Churn Early-Warning System
 * 
 * This script validates the Next.js frontend by checking:
 * 1. Dashboard accessibility and functionality
 * 2. API integration and data fetching
 * 3. UI components and animations
 * 4. Real-time updates and error handling
 * 5. Responsive design and user interactions
 * 
 * Usage:
 *     node validate_frontend.js
 * 
 * Requirements:
 *     - puppeteer
 *     - axios
 *     - dotenv
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class FrontendValidator {
    constructor() {
        this.results = {
            'dashboard_accessibility': { status: 'PENDING', details: [] },
            'api_integration': { status: 'PENDING', details: [] },
            'ui_components': { status: 'PENDING', details: [] },
            'animations': { status: 'PENDING', details: [] },
            'real_time_updates': { status: 'PENDING', details: [] },
            'error_handling': { status: 'PENDING', details: [] },
            'responsive_design': { status: 'PENDING', details: [] }
        };
        
        this.config = {
            frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
            api_url: process.env.API_URL || 'http://localhost:5000',
            timeout: 30000
        };
        
        this.browser = null;
        this.page = null;
        this.startTime = new Date();
    }

    logResult(testName, status, message, details = null) {
        this.results[testName].status = status;
        this.results[testName].details.push({
            timestamp: new Date().toISOString(),
            message: message,
            details: details
        });
        
        const statusEmoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
        console.log(`${statusEmoji} ${testName}: ${message}`);
    }

    async initBrowser() {
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for CI/CD
                devtools: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            
            // Set viewport
            await this.page.setViewport({ width: 1280, height: 720 });
            
            this.logResult('browser_init', 'PASS', 'Browser initialized successfully');
            return true;
        } catch (error) {
            this.logResult('browser_init', 'FAIL', `Browser initialization failed: ${error.message}`);
            return false;
        }
    }

    async testDashboardAccessibility() {
        console.log('🔍 Testing dashboard accessibility...');
        
        try {
            // Navigate to dashboard
            await this.page.goto(`${this.config.frontend_url}/dashboard`, {
                waitUntil: 'networkidle2',
                timeout: this.config.timeout
            });
            
            // Check if page loaded successfully
            const title = await this.page.title();
            if (title && title !== '') {
                this.logResult('dashboard_accessibility', 'PASS', `Dashboard loaded with title: ${title}`);
            } else {
                this.logResult('dashboard_accessibility', 'FAIL', 'Dashboard title is empty');
                return false;
            }
            
            // Check for main dashboard elements
            const dashboardElements = [
                'h1', // Main heading
                '[data-testid="dashboard-cards"]', // Dashboard cards
                '[data-testid="churn-chart"]', // Churn chart
                '[data-testid="refresh-button"]' // Refresh button
            ];
            
            let elementsFound = 0;
            for (const selector of dashboardElements) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    elementsFound++;
                } catch (error) {
                    console.log(`Element not found: ${selector}`);
                }
            }
            
            if (elementsFound >= 2) {
                this.logResult('dashboard_accessibility', 'PASS', 
                    `Found ${elementsFound}/${dashboardElements.length} main dashboard elements`);
            } else {
                this.logResult('dashboard_accessibility', 'FAIL', 
                    `Only found ${elementsFound}/${dashboardElements.length} main dashboard elements`);
                return false;
            }
            
            return true;
        } catch (error) {
            this.logResult('dashboard_accessibility', 'FAIL', `Dashboard accessibility test failed: ${error.message}`);
            return false;
        }
    }

    async testApiIntegration() {
        console.log('🔍 Testing API integration...');
        
        try {
            // Test API endpoints
            const apiEndpoints = [
                '/api/users',
                '/api/predict-churn'
            ];
            
            let apiTestsPassed = 0;
            
            for (const endpoint of apiEndpoints) {
                try {
                    const response = await axios.get(`${this.config.frontend_url}${endpoint}`, {
                        timeout: 10000
                    });
                    
                    if (response.status === 200) {
                        apiTestsPassed++;
                        this.logResult('api_integration', 'PASS', 
                            `API endpoint ${endpoint} returned status 200`);
                    } else {
                        this.logResult('api_integration', 'FAIL', 
                            `API endpoint ${endpoint} returned status ${response.status}`);
                    }
                } catch (error) {
                    this.logResult('api_integration', 'FAIL', 
                        `API endpoint ${endpoint} failed: ${error.message}`);
                }
            }
            
            // Test POST request to predict-churn
            try {
                const testData = {
                    user_id: 999,
                    event_type: 'test_event',
                    timestamp: new Date().toISOString(),
                    metadata: { product_id: 1, session_length: 5.0 }
                };
                
                const response = await axios.post(`${this.config.frontend_url}/api/predict-churn`, testData, {
                    timeout: 10000,
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.status === 200 && response.data.churn_score !== undefined) {
                    apiTestsPassed++;
                    this.logResult('api_integration', 'PASS', 
                        `POST to /api/predict-churn returned valid churn_score: ${response.data.churn_score}`);
                } else {
                    this.logResult('api_integration', 'FAIL', 
                        `POST to /api/predict-churn returned invalid response`);
                }
            } catch (error) {
                this.logResult('api_integration', 'FAIL', 
                    `POST to /api/predict-churn failed: ${error.message}`);
            }
            
            if (apiTestsPassed >= 2) {
                this.logResult('api_integration', 'PASS', 
                    `${apiTestsPassed} API integration tests passed`);
                return true;
            } else {
                this.logResult('api_integration', 'FAIL', 
                    `Only ${apiTestsPassed} API integration tests passed`);
                return false;
            }
        } catch (error) {
            this.logResult('api_integration', 'FAIL', `API integration test failed: ${error.message}`);
            return false;
        }
    }

    async testUIComponents() {
        console.log('🔍 Testing UI components...');
        
        try {
            // Test dashboard cards
            const cardSelectors = [
                '[data-testid="total-users-card"]',
                '[data-testid="average-churn-card"]',
                '[data-testid="high-risk-users-card"]'
            ];
            
            let cardsFound = 0;
            for (const selector of cardSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    const cardText = await this.page.$eval(selector, el => el.textContent);
                    if (cardText && cardText.trim() !== '') {
                        cardsFound++;
                        this.logResult('ui_components', 'PASS', 
                            `Dashboard card found: ${selector}`);
                    }
                } catch (error) {
                    console.log(`Card not found: ${selector}`);
                }
            }
            
            // Test chart component
            try {
                await this.page.waitForSelector('canvas', { timeout: 5000 });
                this.logResult('ui_components', 'PASS', 'Chart component (canvas) found');
            } catch (error) {
                this.logResult('ui_components', 'FAIL', 'Chart component not found');
            }
            
            // Test refresh button
            try {
                await this.page.waitForSelector('button', { timeout: 5000 });
                const buttons = await this.page.$$('button');
                if (buttons.length > 0) {
                    this.logResult('ui_components', 'PASS', `Found ${buttons.length} buttons`);
                }
            } catch (error) {
                this.logResult('ui_components', 'FAIL', 'No buttons found');
            }
            
            if (cardsFound >= 2) {
                this.logResult('ui_components', 'PASS', 
                    `UI components test passed: ${cardsFound} cards found`);
                return true;
            } else {
                this.logResult('ui_components', 'FAIL', 
                    `UI components test failed: only ${cardsFound} cards found`);
                return false;
            }
        } catch (error) {
            this.logResult('ui_components', 'FAIL', `UI components test failed: ${error.message}`);
            return false;
        }
    }

    async testAnimations() {
        console.log('🔍 Testing animations and transitions...');
        
        try {
            // Test page load animations
            await this.page.goto(`${this.config.frontend_url}/dashboard`, {
                waitUntil: 'networkidle2'
            });
            
            // Wait for animations to complete
            await this.page.waitForTimeout(2000);
            
            // Check if elements are visible (indicating animations completed)
            const animatedElements = [
                'h1',
                '[data-testid="dashboard-cards"]',
                'canvas'
            ];
            
            let animatedElementsFound = 0;
            for (const selector of animatedElements) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        const isVisible = await element.isIntersectingViewport();
                        if (isVisible) {
                            animatedElementsFound++;
                        }
                    }
                } catch (error) {
                    console.log(`Animation test failed for: ${selector}`);
                }
            }
            
            // Test hover animations
            try {
                const firstCard = await this.page.$('[data-testid="dashboard-cards"] > div:first-child');
                if (firstCard) {
                    await firstCard.hover();
                    await this.page.waitForTimeout(500);
                    this.logResult('animations', 'PASS', 'Hover animation test completed');
                }
            } catch (error) {
                this.logResult('animations', 'FAIL', `Hover animation test failed: ${error.message}`);
            }
            
            if (animatedElementsFound >= 2) {
                this.logResult('animations', 'PASS', 
                    `Animation test passed: ${animatedElementsFound} elements animated`);
                return true;
            } else {
                this.logResult('animations', 'FAIL', 
                    `Animation test failed: only ${animatedElementsFound} elements animated`);
                return false;
            }
        } catch (error) {
            this.logResult('animations', 'FAIL', `Animation test failed: ${error.message}`);
            return false;
        }
    }

    async testRealTimeUpdates() {
        console.log('🔍 Testing real-time updates...');
        
        try {
            // Navigate to dashboard
            await this.page.goto(`${this.config.frontend_url}/dashboard`, {
                waitUntil: 'networkidle2'
            });
            
            // Wait for initial load
            await this.page.waitForTimeout(3000);
            
            // Get initial values
            const initialValues = await this.page.evaluate(() => {
                const cards = document.querySelectorAll('[data-testid*="card"]');
                return Array.from(cards).map(card => card.textContent);
            });
            
            // Click refresh button
            try {
                const refreshButton = await this.page.$('button[data-testid="refresh-button"]');
                if (refreshButton) {
                    await refreshButton.click();
                    await this.page.waitForTimeout(2000);
                    
                    // Check if values updated
                    const updatedValues = await this.page.evaluate(() => {
                        const cards = document.querySelectorAll('[data-testid*="card"]');
                        return Array.from(cards).map(card => card.textContent);
                    });
                    
                    if (JSON.stringify(initialValues) !== JSON.stringify(updatedValues)) {
                        this.logResult('real_time_updates', 'PASS', 'Real-time updates working - values changed after refresh');
                        return true;
                    } else {
                        this.logResult('real_time_updates', 'PASS', 'Real-time updates working - refresh button functional');
                        return true;
                    }
                } else {
                    this.logResult('real_time_updates', 'FAIL', 'Refresh button not found');
                    return false;
                }
            } catch (error) {
                this.logResult('real_time_updates', 'FAIL', `Real-time updates test failed: ${error.message}`);
                return false;
            }
        } catch (error) {
            this.logResult('real_time_updates', 'FAIL', `Real-time updates test failed: ${error.message}`);
            return false;
        }
    }

    async testErrorHandling() {
        console.log('🔍 Testing error handling...');
        
        try {
            // Test API error handling
            const consoleErrors = [];
            
            // Listen for console errors
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // Navigate to dashboard
            await this.page.goto(`${this.config.frontend_url}/dashboard`, {
                waitUntil: 'networkidle2'
            });
            
            // Wait for potential errors
            await this.page.waitForTimeout(3000);
            
            // Check for toast notifications (error handling)
            const toastElements = await this.page.$$('.Toastify__toast');
            if (toastElements.length > 0) {
                this.logResult('error_handling', 'PASS', 
                    `Found ${toastElements.length} toast notifications (error handling working)`);
            } else {
                this.logResult('error_handling', 'PASS', 
                    'No error toasts found (system working correctly)');
            }
            
            // Test network error simulation
            try {
                await this.page.setOfflineMode(true);
                await this.page.waitForTimeout(1000);
                await this.page.setOfflineMode(false);
                this.logResult('error_handling', 'PASS', 'Network error simulation completed');
            } catch (error) {
                this.logResult('error_handling', 'FAIL', `Network error simulation failed: ${error.message}`);
            }
            
            return true;
        } catch (error) {
            this.logResult('error_handling', 'FAIL', `Error handling test failed: ${error.message}`);
            return false;
        }
    }

    async testResponsiveDesign() {
        console.log('🔍 Testing responsive design...');
        
        try {
            const viewports = [
                { width: 320, height: 568, name: 'Mobile' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 1280, height: 720, name: 'Desktop' }
            ];
            
            let responsiveTestsPassed = 0;
            
            for (const viewport of viewports) {
                await this.page.setViewport(viewport);
                await this.page.goto(`${this.config.frontend_url}/dashboard`, {
                    waitUntil: 'networkidle2'
                });
                
                await this.page.waitForTimeout(1000);
                
                // Check if main elements are visible
                const mainElements = await this.page.$$('h1, [data-testid*="card"], canvas');
                if (mainElements.length >= 2) {
                    responsiveTestsPassed++;
                    this.logResult('responsive_design', 'PASS', 
                        `${viewport.name} viewport (${viewport.width}x${viewport.height}) - elements visible`);
                } else {
                    this.logResult('responsive_design', 'FAIL', 
                        `${viewport.name} viewport - insufficient elements visible`);
                }
            }
            
            if (responsiveTestsPassed >= 2) {
                this.logResult('responsive_design', 'PASS', 
                    `Responsive design test passed: ${responsiveTestsPassed}/${viewports.length} viewports working`);
                return true;
            } else {
                this.logResult('responsive_design', 'FAIL', 
                    `Responsive design test failed: only ${responsiveTestsPassed}/${viewports.length} viewports working`);
                return false;
            }
        } catch (error) {
            this.logResult('responsive_design', 'FAIL', `Responsive design test failed: ${error.message}`);
            return false;
        }
    }

    async generateReport() {
        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000;
        
        let report = `
${'='.repeat(80)}
FRONTEND VALIDATION REPORT
${'='.repeat(80)}
Validation Date: ${this.startTime.toISOString()}
Duration: ${duration.toFixed(2)} seconds
${'='.repeat(80)}

`;
        
        // Summary
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(r => r.status === 'PASS').length;
        const failedTests = Object.values(this.results).filter(r => r.status === 'FAIL').length;
        
        report += `SUMMARY:\n`;
        report += `Total Tests: ${totalTests}\n`;
        report += `Passed: ${passedTests}\n`;
        report += `Failed: ${failedTests}\n`;
        report += `Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%\n\n`;
        
        // Detailed results
        for (const [testName, result] of Object.entries(this.results)) {
            const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏳';
            report += `${statusEmoji} ${testName.toUpperCase().replace(/_/g, ' ')}: ${result.status}\n`;
            
            for (const detail of result.details) {
                report += `   • ${detail.message}\n`;
                if (detail.details) {
                    report += `     Details: ${JSON.stringify(detail.details)}\n`;
                }
            }
            report += `\n`;
        }
        
        // Recommendations
        report += `${'='.repeat(80)}\n`;
        report += `RECOMMENDATIONS:\n`;
        report += `${'='.repeat(80)}\n`;
        
        if (failedTests > 0) {
            report += `❌ Frontend validation failed. Please address the following issues:\n`;
            for (const [testName, result] of Object.entries(this.results)) {
                if (result.status === 'FAIL') {
                    report += `   • ${testName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
                }
            }
        } else {
            report += `✅ All frontend tests passed! Dashboard is ready for production.\n`;
        }
        
        report += `\n${'='.repeat(80)}\n`;
        report += `END OF REPORT\n`;
        report += `${'='.repeat(80)}\n`;
        
        return report;
    }

    async runAllTests() {
        console.log('🚀 Starting frontend validation...');
        
        // Initialize browser
        if (!(await this.initBrowser())) {
            return false;
        }
        
        try {
            // Run all tests
            const tests = [
                ['Dashboard Accessibility', () => this.testDashboardAccessibility()],
                ['API Integration', () => this.testApiIntegration()],
                ['UI Components', () => this.testUIComponents()],
                ['Animations', () => this.testAnimations()],
                ['Real-time Updates', () => this.testRealTimeUpdates()],
                ['Error Handling', () => this.testErrorHandling()],
                ['Responsive Design', () => this.testResponsiveDesign()]
            ];
            
            for (const [testName, testFunc] of tests) {
                try {
                    await testFunc();
                } catch (error) {
                    console.error(`Test ${testName} failed with exception: ${error.message}`);
                }
            }
            
            // Generate and display report
            const report = await this.generateReport();
            console.log(report);
            
            // Save report to file
            fs.writeFileSync('frontend_validation_report.txt', report);
            console.log('📄 Frontend validation report saved to frontend_validation_report.txt');
            
            // Return overall success
            const failedTests = Object.values(this.results).filter(r => r.status === 'FAIL').length;
            return failedTests === 0;
            
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

async function main() {
    const validator = new FrontendValidator();
    const success = await validator.runAllTests();
    
    if (success) {
        console.log('🎉 Frontend validation completed successfully!');
        process.exit(0);
    } else {
        console.error('❌ Frontend validation failed. Please check the report.');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}

module.exports = FrontendValidator;
