'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { ChurnCondition } from '@/types/offers'

interface AddRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (condition: string, action: string) => Promise<void>
}

const churnConditions: ChurnCondition[] = [
  {
    value: 'churn_risk > 0.7',
    label: 'High Churn Risk (>70%)',
    description: 'Customer has very high probability of churning'
  },
  {
    value: 'churn_risk > 0.5',
    label: 'Medium Churn Risk (>50%)',
    description: 'Customer has moderate probability of churning'
  },
  {
    value: 'churn_risk > 0.3',
    label: 'Low Churn Risk (>30%)',
    description: 'Customer has low probability of churning'
  },
  {
    value: 'days_since_last_order > 30',
    label: 'Inactive Customer (>30 days)',
    description: 'Customer has not made an order in 30+ days'
  },
  {
    value: 'days_since_last_order > 60',
    label: 'Very Inactive Customer (>60 days)',
    description: 'Customer has not made an order in 60+ days'
  },
  {
    value: 'support_tickets > 2',
    label: 'Multiple Support Tickets (>2)',
    description: 'Customer has opened multiple support tickets'
  },
  {
    value: 'payment_failures > 1',
    label: 'Payment Failures (>1)',
    description: 'Customer has experienced multiple payment failures'
  },
  {
    value: 'avg_order_value < 50',
    label: 'Low Order Value (<$50)',
    description: 'Customer has low average order value'
  }
]

export default function AddRuleModal({ isOpen, onClose, onSubmit }: AddRuleModalProps) {
  const [selectedCondition, setSelectedCondition] = useState('')
  const [action, setAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ condition?: string; action?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    const newErrors: { condition?: string; action?: string } = {}
    if (!selectedCondition) {
      newErrors.condition = 'Please select a churn condition'
    }
    if (!action.trim()) {
      newErrors.action = 'Please enter an offer action'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(selectedCondition, action.trim())
      
      // Reset form
      setSelectedCondition('')
      setAction('')
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedCondition('')
      setAction('')
      setErrors({})
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Add New Offer Rule
                    </h2>
                    <p className="text-sm text-gray-600">
                      Create a new rule to automatically trigger offers
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Churn Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Churn Condition *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.condition ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select a churn condition...</option>
                      {churnConditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCondition && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-gray-600"
                    >
                      {churnConditions.find(c => c.value === selectedCondition)?.description}
                    </motion.p>
                  )}
                  {errors.condition && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 flex items-center space-x-2 text-red-600"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.condition}</span>
                    </motion.div>
                  )}
                </div>

                {/* Offer Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Action *
                  </label>
                  <textarea
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="Describe the offer action (e.g., Send 15% discount coupon, Assign customer success manager, etc.)"
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.action ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.action && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 flex items-center space-x-2 text-red-600"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.action}</span>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Rule</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
