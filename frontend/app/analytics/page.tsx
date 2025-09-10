'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Activity, Calendar, Download } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface AnalyticsData {
  totalUsers: number
  churnRate: number
  retentionRate: number
  avgSessionDuration: number
  monthlyActiveUsers: number
  conversionRate: number
}

// ChartData interface would be used when integrating with Chart.js
// interface ChartData { ... }

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  // Mock data
  useEffect(() => {
    const mockData: AnalyticsData = {
      totalUsers: 12543,
      churnRate: 12.5,
      retentionRate: 87.5,
      avgSessionDuration: 8.5,
      monthlyActiveUsers: 8942,
      conversionRate: 3.2
    }
    
    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  // Chart data would be used when integrating with Chart.js
  // const churnTrendData: ChartData = { ... }
  // const userGrowthData: ChartData = { ... }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      
      <main className="pt-24 min-h-screen">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="mb-4 sm:mb-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg"
                  >
                    <BarChart3 className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                    >
                      Analytics Dashboard
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 text-sm sm:text-base md:text-lg font-medium"
                    >
                      📊 Comprehensive business intelligence and insights
                    </motion.p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button
                  variant="outline"
                  icon={<Download className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Export Report
                </Button>
              </motion.div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : analyticsData?.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+12.5% from last month</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `${analyticsData?.churnRate}%`}
                    </p>
                    <p className="text-sm text-green-600">-2.1% from last month</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `${analyticsData?.retentionRate}%`}
                    </p>
                    <p className="text-sm text-green-600">+1.8% from last month</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `${analyticsData?.avgSessionDuration}m`}
                    </p>
                    <p className="text-sm text-red-600">-0.5m from last month</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : analyticsData?.monthlyActiveUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+8.2% from last month</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `${analyticsData?.conversionRate}%`}
                    </p>
                    <p className="text-sm text-green-600">+0.3% from last month</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Churn Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="p-4 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Churn Rate Trend</h3>
                    <p className="text-sm text-gray-600">Monthly churn rate over the last 6 months</p>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with Chart.js or similar library</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* User Growth Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="p-4 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User Growth</h3>
                    <p className="text-sm text-gray-600">New user registrations over time</p>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with Chart.js or similar library</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Additional Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {/* Top Cohorts */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Cohorts</h3>
                <div className="space-y-3">
                  {['Q1-2024', 'Q2-2024', 'Q3-2024'].map((cohort, index) => (
                    <div key={cohort} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{cohort}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${85 - index * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{85 - index * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Distribution */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                <div className="space-y-3">
                  {[
                    { level: 'Low Risk', count: 8542, color: 'bg-green-500' },
                    { level: 'Medium Risk', count: 2847, color: 'bg-yellow-500' },
                    { level: 'High Risk', count: 1154, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.level} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.level}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'High churn risk detected', time: '2 min ago', type: 'alert' },
                    { action: 'New user cohort created', time: '15 min ago', type: 'info' },
                    { action: 'Analytics report generated', time: '1 hour ago', type: 'success' },
                    { action: 'System performance check', time: '2 hours ago', type: 'info' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'alert' ? 'bg-red-500' :
                        activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
