'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Save, Users, Target, AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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

interface CohortFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CohortFormData) => void
  initialData?: CohortFormData | null
  isLoading?: boolean
}

const initialFormData: CohortFormData = {
  name: '',
  description: '',
  engagement_level: '',
  churn_risk_level: '',
  min_age: '',
  max_age: '',
  min_total_purchases: '',
  max_total_purchases: '',
  min_avg_order_value: '',
  max_avg_order_value: '',
  min_days_since_last_purchase: '',
  max_days_since_last_purchase: '',
  min_email_opens: '',
  max_email_opens: '',
  min_website_visits: '',
  max_website_visits: ''
}

export default function CohortForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading = false 
}: CohortFormProps) {
  const [formData, setFormData] = useState<CohortFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleInputChange = (field: keyof CohortFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Cohort name is required'
    }

    // Validate numeric ranges
    const numericFields = [
      'min_age', 'max_age', 'min_total_purchases', 'max_total_purchases',
      'min_avg_order_value', 'max_avg_order_value', 'min_days_since_last_purchase',
      'max_days_since_last_purchase', 'min_email_opens', 'max_email_opens',
      'min_website_visits', 'max_website_visits'
    ]

    numericFields.forEach(field => {
      const value = formData[field as keyof CohortFormData]
      if (value && isNaN(Number(value))) {
        newErrors[field] = 'Must be a valid number'
      }
    })

    // Validate min/max relationships
    if (formData.min_age && formData.max_age && Number(formData.min_age) > Number(formData.max_age)) {
      newErrors.max_age = 'Max age must be greater than min age'
    }

    if (formData.min_total_purchases && formData.max_total_purchases && 
        Number(formData.min_total_purchases) > Number(formData.max_total_purchases)) {
      newErrors.max_total_purchases = 'Max purchases must be greater than min purchases'
    }

    if (formData.min_avg_order_value && formData.max_avg_order_value && 
        Number(formData.min_avg_order_value) > Number(formData.max_avg_order_value)) {
      newErrors.max_avg_order_value = 'Max order value must be greater than min order value'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Edit Cohort' : 'Create New Cohort'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cohort Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter cohort name"
                    error={errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter cohort description"
                  />
                </div>
              </div>
            </div>

            {/* Level Filters */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Level Filters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Level
                  </label>
                  <select
                    value={formData.engagement_level}
                    onChange={(e) => handleInputChange('engagement_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
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
                    value={formData.churn_risk_level}
                    onChange={(e) => handleInputChange('churn_risk_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Numeric Ranges */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Numeric Ranges
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Age Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age Range
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_age}
                      onChange={(e) => handleInputChange('min_age', e.target.value)}
                      placeholder="Min"
                      type="number"
                      error={errors.min_age}
                    />
                    <Input
                      value={formData.max_age}
                      onChange={(e) => handleInputChange('max_age', e.target.value)}
                      placeholder="Max"
                      type="number"
                      error={errors.max_age}
                    />
                  </div>
                  {errors.max_age && (
                    <p className="text-sm text-red-600">{errors.max_age}</p>
                  )}
                </div>

                {/* Total Purchases Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Purchases
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_total_purchases}
                      onChange={(e) => handleInputChange('min_total_purchases', e.target.value)}
                      placeholder="Min"
                      type="number"
                      error={errors.min_total_purchases}
                    />
                    <Input
                      value={formData.max_total_purchases}
                      onChange={(e) => handleInputChange('max_total_purchases', e.target.value)}
                      placeholder="Max"
                      type="number"
                      error={errors.max_total_purchases}
                    />
                  </div>
                  {errors.max_total_purchases && (
                    <p className="text-sm text-red-600">{errors.max_total_purchases}</p>
                  )}
                </div>

                {/* Average Order Value Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Avg Order Value ($)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_avg_order_value}
                      onChange={(e) => handleInputChange('min_avg_order_value', e.target.value)}
                      placeholder="Min"
                      type="number"
                      step="0.01"
                      error={errors.min_avg_order_value}
                    />
                    <Input
                      value={formData.max_avg_order_value}
                      onChange={(e) => handleInputChange('max_avg_order_value', e.target.value)}
                      placeholder="Max"
                      type="number"
                      step="0.01"
                      error={errors.max_avg_order_value}
                    />
                  </div>
                  {errors.max_avg_order_value && (
                    <p className="text-sm text-red-600">{errors.max_avg_order_value}</p>
                  )}
                </div>

                {/* Days Since Last Purchase Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Days Since Last Purchase
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_days_since_last_purchase}
                      onChange={(e) => handleInputChange('min_days_since_last_purchase', e.target.value)}
                      placeholder="Min"
                      type="number"
                    />
                    <Input
                      value={formData.max_days_since_last_purchase}
                      onChange={(e) => handleInputChange('max_days_since_last_purchase', e.target.value)}
                      placeholder="Max"
                      type="number"
                    />
                  </div>
                </div>

                {/* Email Opens Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Opens
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_email_opens}
                      onChange={(e) => handleInputChange('min_email_opens', e.target.value)}
                      placeholder="Min"
                      type="number"
                    />
                    <Input
                      value={formData.max_email_opens}
                      onChange={(e) => handleInputChange('max_email_opens', e.target.value)}
                      placeholder="Max"
                      type="number"
                    />
                  </div>
                </div>

                {/* Website Visits Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Website Visits
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.min_website_visits}
                      onChange={(e) => handleInputChange('min_website_visits', e.target.value)}
                      placeholder="Min"
                      type="number"
                    />
                    <Input
                      value={formData.max_website_visits}
                      onChange={(e) => handleInputChange('max_website_visits', e.target.value)}
                      placeholder="Max"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {initialData ? 'Update Cohort' : 'Create Cohort'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
