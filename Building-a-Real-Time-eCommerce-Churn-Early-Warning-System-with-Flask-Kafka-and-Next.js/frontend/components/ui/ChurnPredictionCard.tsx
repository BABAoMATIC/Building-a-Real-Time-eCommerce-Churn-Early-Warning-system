'use client';

import React from 'react';
import { useChurn } from '@/hooks/useChurn';

interface ChurnPredictionCardProps {
  userId?: number;
  eventType?: string;
  metadata?: Record<string, any>;
  className?: string;
}

export const ChurnPredictionCard: React.FC<ChurnPredictionCardProps> = ({
  userId = 1,
  eventType = 'page_view',
  metadata = {},
  className = ''
}) => {
  const { churnScore, isLoading, error, predictChurn, clearError } = useChurn();

  const handlePredict = () => {
    predictChurn(userId, eventType, metadata);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (score >= 0.6) return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const riskInfo = churnScore !== null ? getRiskLevel(churnScore) : null;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Churn Prediction</h3>
        <button
          onClick={handlePredict}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Predicting...' : 'Predict Churn'}
        </button>
      </div>

      <div className="space-y-4">
        {/* User Info */}
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">User ID:</span> {userId}</p>
          <p><span className="font-medium">Event Type:</span> {eventType}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Analyzing user behavior...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">Prediction Failed</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Churn Score Display */}
        {churnScore !== null && !isLoading && !error && (
          <div className={`rounded-lg p-4 ${riskInfo?.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Churn Risk Score</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskInfo?.color} ${riskInfo?.bgColor}`}>
                {riskInfo?.level} Risk
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                {(churnScore * 100).toFixed(1)}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      churnScore >= 0.8 ? 'bg-red-500' :
                      churnScore >= 0.6 ? 'bg-orange-500' :
                      churnScore >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${churnScore * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Score: {churnScore.toFixed(3)}
                </p>
              </div>
            </div>

            {/* Risk Description */}
            <div className="mt-3 text-sm text-gray-700">
              {churnScore >= 0.8 && (
                <p>⚠️ Critical risk: Immediate intervention recommended</p>
              )}
              {churnScore >= 0.6 && churnScore < 0.8 && (
                <p>🔶 High risk: Proactive engagement needed</p>
              )}
              {churnScore >= 0.4 && churnScore < 0.6 && (
                <p>🟡 Medium risk: Monitor closely</p>
              )}
              {churnScore < 0.4 && (
                <p>✅ Low risk: User appears engaged</p>
              )}
            </div>
          </div>
        )}

        {/* No Prediction State */}
        {churnScore === null && !isLoading && !error && (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Click "Predict Churn" to analyze user behavior</p>
          </div>
        )}
      </div>
    </div>
  );
};
