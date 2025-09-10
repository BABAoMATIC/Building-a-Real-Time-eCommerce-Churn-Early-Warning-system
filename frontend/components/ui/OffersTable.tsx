'use client'

import { motion } from 'framer-motion'
import { Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Clock } from 'lucide-react'
import { OfferRule } from '@/types/offers'

interface OffersTableProps {
  rules: OfferRule[]
  onEdit?: (rule: OfferRule) => void
  onDelete?: (ruleId: string) => void
  onToggleStatus?: (ruleId: string) => void
}

export default function OffersTable({ rules, onEdit, onDelete, onToggleStatus }: OffersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule, index) => (
              <motion.tr
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      rule.condition.includes('> 0.7') ? 'bg-red-500' :
                      rule.condition.includes('> 0.5') ? 'bg-orange-500' :
                      rule.condition.includes('> 0.3') ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rule.condition}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rule.condition.includes('churn_risk') ? 'Churn Risk' :
                         rule.condition.includes('days_since') ? 'Activity' :
                         rule.condition.includes('support') ? 'Support' :
                         rule.condition.includes('payment') ? 'Payment' :
                         'Order Value'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-900 truncate">
                      {rule.action}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleStatus?.(rule.id)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      rule.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                    <span>{rule.isActive ? 'Active' : 'Inactive'}</span>
                  </motion.button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(rule.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(rule.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit?.(rule)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit rule"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete?.(rule.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {rules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offer rules found</h3>
          <p className="text-gray-600">Get started by creating your first offer rule.</p>
        </motion.div>
      )}
    </div>
  )
}
