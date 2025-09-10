'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Plus, RefreshCw, AlertTriangle, Target, TrendingUp } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import OffersTable from '@/components/ui/OffersTable'
import AddRuleModal from '@/components/ui/AddRuleModal'
import { OfferRule, OfferRulesResponse } from '@/types/offers'
import 'react-toastify/dist/ReactToastify.css'

export default function OffersPage() {
  const [rules, setRules] = useState<OfferRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRules = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/offers')
      if (!response.ok) {
        throw new Error('Failed to fetch offer rules')
      }
      const data: OfferRulesResponse = await response.json()
      setRules(data.rules)
    } catch (err) {
      setError('Failed to load offer rules')
      console.error('Error fetching offer rules:', err)
      toast.error('Failed to load offer rules')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRule = async (condition: string, action: string) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ condition, action }),
      })

      if (!response.ok) {
        throw new Error('Failed to create offer rule')
      }

      const newRule = await response.json()
      setRules(prev => [newRule, ...prev])
      toast.success('Offer rule created successfully!')
    } catch (err) {
      console.error('Error creating offer rule:', err)
      toast.error('Failed to create offer rule')
      throw err
    }
  }

  const handleToggleStatus = async (ruleId: string) => {
    try {
      // In a real app, you'd make an API call here
      setRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
          : rule
      ))
      toast.success('Rule status updated successfully!')
    } catch (err) {
      console.error('Error updating rule status:', err)
      toast.error('Failed to update rule status')
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        // In a real app, you'd make an API call here
        setRules(prev => prev.filter(rule => rule.id !== ruleId))
        toast.success('Rule deleted successfully!')
      } catch (err) {
        console.error('Error deleting rule:', err)
        toast.error('Failed to delete rule')
      }
    }
  }

  const handleEditRule = () => {
    // In a real app, you'd open an edit modal or navigate to edit page
    toast.info('Edit functionality coming soon!')
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const activeRules = rules.filter(rule => rule.isActive).length
  const totalRules = rules.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading offer rules...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Rules</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRules}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <Topbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <main className="pt-20 sm:pt-24 min-h-screen">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
          >
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Offer Rules Management
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
                    Create and manage automated offer rules based on customer behavior patterns and churn risk levels
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchRules}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Refresh</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Rule</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Rules</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalRules}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Rules</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{activeRules}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Inactive Rules</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalRules - activeRules}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Offers Table Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Offer Rules</h2>
                <p className="text-gray-600 mt-1">Manage your automated offer rules and their status</p>
              </div>
              <div className="p-6">
                <OffersTable
                  rules={rules}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Add Rule Modal */}
      <AddRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRule}
      />
    </div>
  )
}
