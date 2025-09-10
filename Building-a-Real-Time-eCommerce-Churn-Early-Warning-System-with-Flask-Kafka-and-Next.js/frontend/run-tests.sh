#!/bin/bash

# Test Runner Script for useChurn Hook Tests
# This script demonstrates how to run the comprehensive test suite

echo "🧪 Running useChurn Hook Test Suite"
echo "=================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔍 Running useChurn Hook Tests..."
echo "--------------------------------"
npm test -- __tests__/hooks/useChurn.test.ts --verbose

echo ""
echo "🎨 Running ChurnPredictionCard Component Tests..."
echo "------------------------------------------------"
npm test -- __tests__/components/ChurnPredictionCard.test.tsx --verbose

echo ""
echo "📊 Running All Tests with Coverage..."
echo "------------------------------------"
npm run test:coverage

echo ""
echo "✅ Test Suite Complete!"
echo "======================"
echo ""
echo "Test Summary:"
echo "- useChurn Hook: Tests API integration, loading states, error handling"
echo "- ChurnPredictionCard: Tests component rendering, user interactions"
echo "- Coverage: Ensures comprehensive test coverage of all scenarios"
echo ""
echo "Key Test Scenarios Covered:"
echo "✅ Successful churn score prediction and display"
echo "✅ Loading state management during API calls"
echo "✅ Error message display for failed requests"
echo "✅ Button state management (enabled/disabled)"
echo "✅ Risk level calculation and styling"
echo "✅ Progress bar width calculation"
echo "✅ Multiple prediction requests handling"
echo "✅ Error dismissal functionality"
echo ""
echo "To run tests in watch mode: npm run test:watch"
echo "To run specific tests: npm test -- --testNamePattern='Loading State'"
