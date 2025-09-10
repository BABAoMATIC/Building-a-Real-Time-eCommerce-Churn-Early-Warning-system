'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useABTest } from '@/hooks/useABTest';
import { ABTestToggle } from '@/components/ui/ABTestToggle';
import { OfferRuleCard } from '@/components/ui/OfferRuleCard';
import { RefreshCw, AlertTriangle, BarChart3, Users, Clock } from 'lucide-react';

export default function ABTestPage() {
  const { abTestData, error, updateABTestCondition, resetABTest } = useABTest();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = async (newCondition: 'control' | 'treatment') => {
    if (isTransitioning || !abTestData) return;

    setIsTransitioning(true);
    try {
      await updateABTestCondition(newCondition);
    } catch (err) {
      console.error('Failed to update A/B test condition:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleReset = async () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    try {
      await resetABTest();
    } catch (err) {
      console.error('Failed to reset A/B test:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading A/B Test</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Test Management</h1>
              <p className="text-gray-600">
                Manage and monitor your churn prevention A/B test
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                disabled={isTransitioning}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Test
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Test Metadata */}
        {abTestData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Test Name</p>
                  <p className="font-medium text-gray-900">{abTestData.test_metadata.test_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{abTestData.test_metadata.expected_duration}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Metrics</p>
                  <p className="font-medium text-gray-900">{abTestData.test_metadata.success_metrics.length} metrics</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Toggle Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Control</h3>
              
              {abTestData ? (
                <ABTestToggle
                  currentCondition={abTestData.current_condition}
                  onToggle={handleToggle}
                  isLoading={isTransitioning}
                />
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Offer Rules Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Offer Rules</h3>
              
              {abTestData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={abTestData.current_condition}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OfferRuleCard
                        offerRule={abTestData.conditions.control.offer_rule}
                        conditionType="control"
                        isActive={abTestData.current_condition === 'control'}
                        isLoading={isTransitioning}
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${abTestData.current_condition}-treatment`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <OfferRuleCard
                        offerRule={abTestData.conditions.treatment.offer_rule}
                        conditionType="treatment"
                        isActive={abTestData.current_condition === 'treatment'}
                        isLoading={isTransitioning}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Success Metrics */}
        {abTestData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
            <div className="flex flex-wrap gap-2">
              {abTestData.test_metadata.success_metrics.map((metric, index) => (
                <motion.span
                  key={metric}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {metric.replace('_', ' ').toUpperCase()}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
