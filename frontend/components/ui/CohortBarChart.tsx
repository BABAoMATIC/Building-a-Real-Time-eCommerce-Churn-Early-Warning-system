'use client';

import React from 'react';
import { CohortData } from '@/hooks/useCohorts';

interface CohortBarChartProps {
  data: CohortData[];
  totalUsers: number;
  isLoading?: boolean;
}

export const CohortBarChart: React.FC<CohortBarChartProps> = ({ 
  data, 
  totalUsers, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        <p>No cohort data available</p>
      </div>
    );
  }

  // Find the maximum count for scaling
  const maxCount = Math.max(...data.map(item => item.count));

  // Color scheme for different risk levels
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-700';
      case 'medium':
        return 'text-yellow-700';
      case 'high':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          User Cohorts by Churn Risk
        </h3>
        <p className="text-sm text-gray-600">
          Total Users: <span className="font-medium">{totalUsers.toLocaleString()}</span>
        </p>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {data.map((cohort) => {
          const barHeight = (cohort.count / maxCount) * 100;
          
          return (
            <div key={cohort.risk_level} className="flex items-center space-x-4">
              {/* Risk Level Label */}
              <div className="w-20 text-right">
                <span className={`text-sm font-medium ${getRiskTextColor(cohort.risk_level)}`}>
                  {cohort.risk_level}
                </span>
              </div>

              {/* Bar Container */}
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Bar */}
                  <div
                    className={`h-full ${getRiskColor(cohort.risk_level)} transition-all duration-500 ease-out rounded-lg`}
                    style={{ width: `${barHeight}%` }}
                  >
                    {/* Bar Content */}
                    <div className="h-full flex items-center justify-end pr-3">
                      <span className="text-white text-xs font-medium">
                        {cohort.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Percentage Label */}
                <div className="absolute top-0 right-0 h-8 flex items-center">
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                    {cohort.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {data.map((cohort) => (
          <div key={cohort.risk_level} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${getRiskColor(cohort.risk_level).split(' ')[0]}`}></div>
            <span className="text-sm text-gray-600">
              {cohort.risk_level} Risk ({cohort.count.toLocaleString()} users)
            </span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((cohort) => (
          <div key={cohort.risk_level} className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRiskTextColor(cohort.risk_level)}`}>
                {cohort.count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {cohort.risk_level} Risk Users
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {cohort.percentage.toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
