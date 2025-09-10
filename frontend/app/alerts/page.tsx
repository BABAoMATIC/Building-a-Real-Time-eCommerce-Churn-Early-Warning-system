'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { AlertTriangle, Bell, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Alert {
  id: string
  type: 'churn_risk' | 'system' | 'performance' | 'security'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  timestamp: string
  user_id?: string
  user_name?: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  // Mock data
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'churn_risk',
        title: 'High Churn Risk Detected',
        message: 'User John Doe shows 85% churn probability based on recent behavior patterns',
        severity: 'high',
        status: 'active',
        timestamp: '2 minutes ago',
        user_id: '1',
        user_name: 'John Doe'
      },
      {
        id: '2',
        type: 'system',
        title: 'API Response Time High',
        message: 'Average API response time exceeded 2 seconds in the last 5 minutes',
        severity: 'medium',
        status: 'acknowledged',
        timestamp: '15 minutes ago'
      },
      {
        id: '3',
        type: 'performance',
        title: 'Database Connection Pool Exhausted',
        message: 'Database connection pool is at 95% capacity',
        severity: 'critical',
        status: 'active',
        timestamp: '1 hour ago'
      },
      {
        id: '4',
        type: 'churn_risk',
        title: 'Multiple Users at Risk',
        message: '5 users in cohort Q1-2024 showing increased churn indicators',
        severity: 'medium',
        status: 'resolved',
        timestamp: '2 hours ago'
      }
    ]
    
    setTimeout(() => {
      setAlerts(mockAlerts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50'
      case 'acknowledged': return 'text-yellow-600 bg-yellow-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'churn_risk': return <AlertTriangle className="h-5 w-5" />
      case 'system': return <Bell className="h-5 w-5" />
      case 'performance': return <Clock className="h-5 w-5" />
      case 'security': return <XCircle className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ))
  }

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ))
  }

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
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl shadow-lg"
                  >
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2"
                    >
                      Alert Center
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 text-sm sm:text-base md:text-lg font-medium"
                    >
                      🚨 Monitor and manage system alerts
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
                <Button
                  variant="outline"
                  icon={<CheckCircle className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Mark All Read
                </Button>
                <Button
                  icon={<Bell className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Create Alert
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.status === 'acknowledged').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts.filter(a => a.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="h-5 w-5" />}
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Alerts List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              {loading ? (
                <Card className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading alerts...</span>
                  </div>
                </Card>
              ) : filteredAlerts.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  No alerts found
                </Card>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className={`p-4 sm:p-6 border-l-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {alert.title}
                              </h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                                {alert.status}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{alert.timestamp}</span>
                              {alert.user_name && (
                                <span>User: {alert.user_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {alert.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcknowledge(alert.id)}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
