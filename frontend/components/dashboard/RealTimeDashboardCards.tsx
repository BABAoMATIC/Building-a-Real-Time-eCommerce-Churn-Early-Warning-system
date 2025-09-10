'use client'

import { motion } from 'framer-motion'
import { DashboardData } from '@/lib/socketService'
import Card from '@/components/ui/Card'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Activity,
  Target,
  Zap,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react'

interface RealTimeDashboardCardsProps {
  data: DashboardData
  loading?: boolean
  isConnected?: boolean
  onRefresh?: () => void
}

export default function RealTimeDashboardCards({ 
  data, 
  loading = false, 
  isConnected = false,
  onRefresh 
}: RealTimeDashboardCardsProps) {
  const metrics = data.metrics
  const trends = data.trends

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600'
      case 'decreasing':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'text-red-600'
    if (score > 0.4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLabel = (score: number) => {
    if (score > 0.7) return 'High Risk'
    if (score > 0.4) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                {isConnected ? (
                  <Activity className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isConnected ? 'Real-time Connected' : 'Offline Mode'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isConnected 
                    ? 'Live data updates every 5 seconds' 
                    : 'Using cached data - reconnecting...'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Last update: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6" data-testid="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="total-predictions">{metrics.total_predictions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.new_predictions_today} new today
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Average Churn Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6" data-testid="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Churn Score</p>
                <p className={`text-3xl font-bold ${getRiskColor(metrics.avg_churn_score)}`}>
                  {metrics.avg_churn_score.toFixed(3)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getRiskLabel(metrics.avg_churn_score)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* High Risk Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6" data-testid="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-3xl font-bold text-red-600">{metrics.high_risk_predictions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {trends.churn_trend === 'increasing' ? 'Trending up' : 'Stable'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Engagement Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6" data-testid="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-3xl font-bold text-green-600">
                  {(metrics.engagement_score * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  {getTrendIcon(trends.engagement_trend)}
                  <span className={`ml-1 ${getTrendColor(trends.engagement_trend)}`}>
                    {trends.engagement_trend}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Retention Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.retention_rate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  {getTrendIcon(trends.retention_trend)}
                  <span className={`ml-1 ${getTrendColor(trends.retention_trend)}`}>
                    {trends.retention_trend}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Active Users Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.active_users_today}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Users active today
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Distribution</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Low: {metrics.low_risk_predictions}</span>
                    <span className="text-yellow-600">Med: {metrics.medium_risk_predictions}</span>
                    <span className="text-red-600">High: {metrics.high_risk_predictions}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {data.alerts && data.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' 
                      ? 'bg-red-50 border-red-400' 
                      : 'bg-yellow-50 border-yellow-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
