'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChurnPredictionCard } from '@/components/ui/ChurnPredictionCard';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const demoScenarios = [
  {
    id: 1,
    title: 'High-Risk User (Bounce)',
    description: 'User bounced from checkout page with short session',
    userId: 101,
    eventType: 'bounce',
    metadata: { page: '/checkout', session_length: 0.5 },
    expectedScore: 0.9,
    color: 'border-red-200 bg-red-50'
  },
  {
    id: 2,
    title: 'Low-Risk User (Purchase)',
    description: 'User completed a purchase successfully',
    userId: 102,
    eventType: 'purchase',
    metadata: { order_id: 'ORD-123', amount: 99.99 },
    expectedScore: 0.2,
    color: 'border-green-200 bg-green-50'
  },
  {
    id: 3,
    title: 'Medium-Risk User (Cart Abandonment)',
    description: 'User added items to cart but didn\'t complete purchase',
    userId: 103,
    eventType: 'add_to_cart',
    metadata: { product_id: 'PROD-456', session_length: 15.2 },
    expectedScore: 0.2,
    color: 'border-yellow-200 bg-yellow-50'
  },
  {
    id: 4,
    title: 'Engaged User (Product View)',
    description: 'User viewing multiple products with good session length',
    userId: 104,
    eventType: 'product_view',
    metadata: { product_id: 'PROD-789', session_length: 8.5 },
    expectedScore: 0.2,
    color: 'border-blue-200 bg-blue-50'
  }
];

export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const currentScenario = demoScenarios[activeScenario];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Churn Prediction Demo
          </h1>
          <p className="text-gray-600">
            Test different user scenarios and see how the churn prediction model responds
          </p>
        </motion.div>

        {/* Scenario Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Scenario
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoScenarios.map((scenario, index) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveScenario(index)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    activeScenario === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Scenario {scenario.id}
                    </span>
                    {activeScenario === index && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {scenario.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Current Scenario Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className={`rounded-lg border-2 p-6 ${currentScenario.color}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentScenario.title}
                </h3>
                <p className="text-gray-600">{currentScenario.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Expected Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(currentScenario.expectedScore * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-gray-900">{currentScenario.userId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Event Type:</span>
                <span className="ml-2 text-gray-900">{currentScenario.eventType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Metadata:</span>
                <span className="ml-2 text-gray-900">
                  {Object.keys(currentScenario.metadata).length} fields
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Churn Prediction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <ChurnPredictionCard
            userId={currentScenario.userId}
            eventType={currentScenario.eventType}
            metadata={currentScenario.metadata}
          />
        </motion.div>

        {/* All Scenarios View */}
        {showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All Scenarios
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {demoScenarios.map((scenario) => (
                  <div key={scenario.id} className="space-y-4">
                    <div className={`p-4 rounded-lg border ${scenario.color}`}>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {scenario.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>User ID: {scenario.userId}</p>
                        <p>Event: {scenario.eventType}</p>
                        <p>Expected Score: {(scenario.expectedScore * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    
                    <ChurnPredictionCard
                      userId={scenario.userId}
                      eventType={scenario.eventType}
                      metadata={scenario.metadata}
                      className="scale-90"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>{showAll ? 'Hide All Scenarios' : 'Show All Scenarios'}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Demo</span>
          </motion.button>
        </motion.div>

        {/* Information Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How It Works
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>
              • The churn prediction model uses rule-based logic to analyze user behavior
            </p>
            <p>
              • <strong>Bounce events</strong> indicate high churn risk (90% score)
            </p>
            <p>
              • <strong>Other events</strong> (purchase, add_to_cart, etc.) indicate lower risk (20% score)
            </p>
            <p>
              • The model considers event type, user metadata, and session information
            </p>
            <p>
              • Scores range from 0.0 (no risk) to 1.0 (high risk)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
