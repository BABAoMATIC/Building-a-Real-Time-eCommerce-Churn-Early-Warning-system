'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  RefreshCw,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import authApi from '@/lib/authApi'

interface CohortData {
  id: number
  user_id: number
  name: string
  description?: string
  criteria: {
    engagement_level?: string
    churn_risk_level?: string
    age_range?: { min?: number; max?: number }
    total_purchases_range?: { min?: number; max?: number }
    avg_order_value_range?: { min?: number; max?: number }
    days_since_last_purchase_range?: { min?: number; max?: number }
    email_opens_range?: { min?: number; max?: number }
    website_visits_range?: { min?: number; max?: number }
  }
  statistics: {
    total_customers: number
    avg_churn_score: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
  }
  is_active: boolean
  created_at: string
  updated_at?: string
  last_calculated?: string
}

interface CohortCardProps {
  cohort: CohortData
  onEdit: (cohort: CohortData) => void
  onDelete: (cohortId: number) => void
  onRefresh: () => void
}

export default function CohortCard({ cohort, onEdit, onDelete, onRefresh }: CohortCardProps) {
  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    try {
      await authApi.recalculateCohort(cohort.id)
      onRefresh()
    } catch (error) {
      console.error('Error recalculating cohort:', error)
    } finally {
      setIsRecalculating(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatRange = (range?: { min?: number; max?: number }) => {
    if (!range) return 'Any'
    const { min, max } = range
    if (min !== undefined && max !== undefined) {
      return `${min} - ${max}`
    } else if (min !== undefined) {
      return `≥ ${min}`
    } else if (max !== undefined) {
      return `≤ ${max}`
    }
    return 'Any'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {cohort.name}
            </h3>
            {cohort.description && (
              <p className="text-sm text-gray-600 mb-2">
                {cohort.description}
              </p>
            )}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Created {formatDate(cohort.created_at)}</span>
              {cohort.last_calculated && (
                <>
                  <span>•</span>
                  <span>Updated {formatDate(cohort.last_calculated)}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(cohort)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(cohort.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {cohort.statistics.total_customers}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Avg Score</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {cohort.statistics.avg_churn_score.toFixed(3)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">High Risk</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {cohort.statistics.high_risk_count}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Low Risk</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {cohort.statistics.low_risk_count}
            </p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Risk Distribution</span>
            <span className="text-gray-500">
              {cohort.statistics.high_risk_count + cohort.statistics.medium_risk_count + cohort.statistics.low_risk_count} customers
            </span>
          </div>
          <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-red-500 h-full"
              style={{ 
                width: `${cohort.statistics.total_customers > 0 ? (cohort.statistics.high_risk_count / cohort.statistics.total_customers) * 100 : 0}%` 
              }}
            />
            <div 
              className="bg-yellow-500 h-full"
              style={{ 
                width: `${cohort.statistics.total_customers > 0 ? (cohort.statistics.medium_risk_count / cohort.statistics.total_customers) * 100 : 0}%` 
              }}
            />
            <div 
              className="bg-green-500 h-full"
              style={{ 
                width: `${cohort.statistics.total_customers > 0 ? (cohort.statistics.low_risk_count / cohort.statistics.total_customers) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>High Risk</span>
            <span>Medium Risk</span>
            <span>Low Risk</span>
          </div>
        </div>

        {/* Criteria Tags */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Criteria</h4>
          <div className="flex flex-wrap gap-2">
            {cohort.criteria.engagement_level && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(cohort.criteria.engagement_level)}`}>
                Engagement: {cohort.criteria.engagement_level}
              </span>
            )}
            {cohort.criteria.churn_risk_level && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(cohort.criteria.churn_risk_level)}`}>
                Risk: {cohort.criteria.churn_risk_level}
              </span>
            )}
            {cohort.criteria.age_range && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                Age: {formatRange(cohort.criteria.age_range)}
              </span>
            )}
            {cohort.criteria.total_purchases_range && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                Purchases: {formatRange(cohort.criteria.total_purchases_range)}
              </span>
            )}
            {cohort.criteria.avg_order_value_range && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                Order Value: ${formatRange(cohort.criteria.avg_order_value_range)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
