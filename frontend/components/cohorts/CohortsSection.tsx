'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Filter, 
  Users, 
  RefreshCw, 
  Search,
  X,
  AlertCircle
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import CohortCard from './CohortCard'
import CohortForm from './CohortForm'
import { useNotifications } from '@/hooks/useNotifications'
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

interface CohortFormData {
  name: string
  description: string
  engagement_level: string
  churn_risk_level: string
  min_age: string
  max_age: string
  min_total_purchases: string
  max_total_purchases: string
  min_avg_order_value: string
  max_avg_order_value: string
  min_days_since_last_purchase: string
  max_days_since_last_purchase: string
  min_email_opens: string
  max_email_opens: string
  min_website_visits: string
  max_website_visits: string
}

export default function CohortsSection() {
  const { showSuccess, showError } = useNotifications()
  const [cohorts, setCohorts] = useState<CohortData[]>([])
  const [filteredCohorts, setFilteredCohorts] = useState<CohortData[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCohort, setEditingCohort] = useState<CohortData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('')
  const [churnRiskFilter, setChurnRiskFilter] = useState('')

  // Load cohorts
  const loadCohorts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.getCohorts()
      if (response.success) {
        setCohorts(response.data)
        setFilteredCohorts(response.data)
      } else {
        const errorMsg = 'Failed to load cohorts'
        setError(errorMsg)
        showError(errorMsg)
      }
    } catch (error) {
      console.error('Error loading cohorts:', error)
      const errorMsg = 'Failed to load cohorts. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = [...cohorts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cohort =>
        cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cohort.description && cohort.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Engagement filter
    if (engagementFilter) {
      filtered = filtered.filter(cohort => cohort.criteria.engagement_level === engagementFilter)
    }

    // Churn risk filter
    if (churnRiskFilter) {
      filtered = filtered.filter(cohort => cohort.criteria.churn_risk_level === churnRiskFilter)
    }

    setFilteredCohorts(filtered)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setEngagementFilter('')
    setChurnRiskFilter('')
    setFilteredCohorts(cohorts)
  }

  // Handle form submission
  const handleFormSubmit = async (formData: CohortFormData) => {
    try {
      setIsSubmitting(true)
      
      // Convert form data to API format
      const apiData = {
        name: formData.name,
        description: formData.description,
        engagement_level: formData.engagement_level || null,
        churn_risk_level: formData.churn_risk_level || null,
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        max_age: formData.max_age ? parseInt(formData.max_age) : null,
        min_total_purchases: formData.min_total_purchases ? parseInt(formData.min_total_purchases) : null,
        max_total_purchases: formData.max_total_purchases ? parseInt(formData.max_total_purchases) : null,
        min_avg_order_value: formData.min_avg_order_value ? parseFloat(formData.min_avg_order_value) : null,
        max_avg_order_value: formData.max_avg_order_value ? parseFloat(formData.max_avg_order_value) : null,
        min_days_since_last_purchase: formData.min_days_since_last_purchase ? parseInt(formData.min_days_since_last_purchase) : null,
        max_days_since_last_purchase: formData.max_days_since_last_purchase ? parseInt(formData.max_days_since_last_purchase) : null,
        min_email_opens: formData.min_email_opens ? parseInt(formData.min_email_opens) : null,
        max_email_opens: formData.max_email_opens ? parseInt(formData.max_email_opens) : null,
        min_website_visits: formData.min_website_visits ? parseInt(formData.min_website_visits) : null,
        max_website_visits: formData.max_website_visits ? parseInt(formData.max_website_visits) : null
      }

      if (editingCohort) {
        // Update existing cohort
        const response = await authApi.updateCohort(editingCohort.id, apiData)
        if (response.success) {
          showSuccess('Cohort updated successfully!')
          await loadCohorts()
        } else {
          showError(response.error || 'Failed to update cohort')
        }
      } else {
        // Create new cohort
        const response = await authApi.createCohort(apiData)
        if (response.success) {
          showSuccess('Cohort created successfully!')
          await loadCohorts()
        } else {
          showError(response.error || 'Failed to create cohort')
        }
      }

      setIsFormOpen(false)
      setEditingCohort(null)
    } catch (error) {
      console.error('Error submitting cohort:', error)
      toast.error('Failed to save cohort')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (cohort: CohortData) => {
    const formData: CohortFormData = {
      name: cohort.name,
      description: cohort.description || '',
      engagement_level: cohort.criteria.engagement_level || '',
      churn_risk_level: cohort.criteria.churn_risk_level || '',
      min_age: cohort.criteria.age_range?.min?.toString() || '',
      max_age: cohort.criteria.age_range?.max?.toString() || '',
      min_total_purchases: cohort.criteria.total_purchases_range?.min?.toString() || '',
      max_total_purchases: cohort.criteria.total_purchases_range?.max?.toString() || '',
      min_avg_order_value: cohort.criteria.avg_order_value_range?.min?.toString() || '',
      max_avg_order_value: cohort.criteria.avg_order_value_range?.max?.toString() || '',
      min_days_since_last_purchase: cohort.criteria.days_since_last_purchase_range?.min?.toString() || '',
      max_days_since_last_purchase: cohort.criteria.days_since_last_purchase_range?.max?.toString() || '',
      min_email_opens: cohort.criteria.email_opens_range?.min?.toString() || '',
      max_email_opens: cohort.criteria.email_opens_range?.max?.toString() || '',
      min_website_visits: cohort.criteria.website_visits_range?.min?.toString() || '',
      max_website_visits: cohort.criteria.website_visits_range?.max?.toString() || ''
    }
    
    setEditingCohort({ ...cohort, formData })
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = async (cohortId: number) => {
    if (window.confirm('Are you sure you want to delete this cohort?')) {
      try {
        const response = await authApi.deleteCohort(cohortId)
        if (response.success) {
          showSuccess('Cohort deleted successfully!')
          await loadCohorts()
        } else {
          showError(response.error || 'Failed to delete cohort')
        }
      } catch (error) {
        console.error('Error deleting cohort:', error)
        showError('Failed to delete cohort. Please try again.')
      }
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    await loadCohorts()
  }

  // Effects
  useEffect(() => {
    loadCohorts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cohorts, searchTerm, engagementFilter, churnRiskFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Customer Cohorts
            </h2>
            <p className="text-gray-600 mt-1">
              Manage and analyze customer segments based on behavior and risk
            </p>
          </div>
        </div>
        
        <LoadingSpinner 
          size="lg" 
          text="Loading cohorts..." 
          className="py-12" 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Customer Cohorts
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and analyze customer segments based on behavior and risk
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingCohort(null)
              setIsFormOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Cohort
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cohorts..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            {(searchTerm || engagementFilter || churnRiskFilter) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Level
                </label>
                <select
                  value={engagementFilter}
                  onChange={(e) => setEngagementFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Churn Risk Level
                </label>
                <select
                  value={churnRiskFilter}
                  onChange={(e) => setChurnRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          title="Error Loading Cohorts"
          message={error}
          onRetry={loadCohorts}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Cohorts Grid */}
      {!error && filteredCohorts.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {cohorts.length === 0 ? 'No cohorts found' : 'No cohorts match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {cohorts.length === 0 
              ? 'Create your first cohort to start analyzing customer segments.'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
          {cohorts.length === 0 && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Cohort
            </Button>
          )}
        </Card>
      ) : !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              cohort={cohort}
              data-testid="cohort-card"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Cohort Form Modal */}
      <CohortForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCohort(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCohort?.formData || null}
        isLoading={isSubmitting}
      />

    </div>
  )
}
