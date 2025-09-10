'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { User, Mail, Building, Calendar, Edit, Save, X, Camera, LogOut, TrendingUp, AlertTriangle, BarChart3, Activity, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import SuccessMessage from '@/components/ui/SuccessMessage'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'
import authApi from '@/lib/authApi'

interface UserProfileData {
  user: {
    id: number
    email: string
    name: string
    company?: string
    role: string
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
    last_login?: string
  }
  activity_summary: {
    total_predictions: number
    avg_churn_score: number
    high_risk_predictions: number
    last_activity?: string
    account_age_days: number
  }
  recent_predictions: Array<{
    id: string
    user_id: string
    churn_score: number
    risk_level: string
    timestamp: string
    file_name?: string
    status: string
  }>
  churn_insights: {
    risk_level: string
    trend: string
    recommendations: string[]
  }
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        company: user.company || '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [user])

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
      try {
        setProfileLoading(true)
        const response = await authApi.getUserProfile()
        if (response.success) {
          setProfileData(response.data)
        } else {
          setMessage({ type: 'error', text: 'Failed to load profile data' })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        setMessage({ type: 'error', text: 'Failed to load profile data' })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validate name
    if (!editForm.name.trim()) {
      errors.name = 'Name is required'
    } else if (editForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    // Validate email
    if (!editForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Validate password if provided
    if (editForm.password) {
      if (editForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(editForm.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and numbers'
      }

      // Validate password confirmation
      if (editForm.password !== editForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage(null)
    setFormErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      password: '',
      confirmPassword: ''
    })
    setMessage(null)
    setFormErrors({})
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage(null)
    setFormErrors({})

    try {
      // Prepare update data (only include fields that have changed)
      const updateData: any = {}
      
      if (editForm.name !== user?.name) {
        updateData.name = editForm.name
      }
      
      if (editForm.email !== user?.email) {
        updateData.email = editForm.email
      }
      
      if (editForm.company !== (user?.company || '')) {
        updateData.company = editForm.company
      }
      
      if (editForm.password) {
        updateData.password = editForm.password
      }

      const result = await authApi.updateUserProfile(updateData)
      
      if (result.success) {
        showSuccess(result.message || 'Profile updated successfully!')
        setMessage({ type: 'success', text: result.message })
        setIsEditing(false)
        
        // Refresh profile data
        const profileResponse = await authApi.getUserProfile()
        if (profileResponse.success) {
          setProfileData(profileResponse.data)
        }
        
        // Update auth context with new user data
        await updateProfile({ name: editForm.name, company: editForm.company })
        
        // Clear password fields
        setEditForm(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }))
      } else {
        showError(result.error || 'Failed to update profile')
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      const errorMessage = 'Failed to update profile. Please try again.'
      showError(errorMessage)
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />
        
        <main className="pt-24 min-h-screen">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
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
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                  >
                    <User className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                    >
                      User Profile
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 text-sm sm:text-base md:text-lg font-medium"
                    >
                      👤 Manage your personal information and preferences
                    </motion.p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-2"
              >
                {!isEditing ? (
                  <>
                    <Button
                      onClick={handleEdit}
                      icon={<Edit className="h-4 w-4" />}
                      iconPosition="left"
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      icon={<LogOut className="h-4 w-4" />}
                      iconPosition="left"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      icon={<X className="h-4 w-4" />}
                      iconPosition="left"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={loading}
                      icon={<Save className="h-4 w-4" />}
                      iconPosition="left"
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Success/Error Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}

            {/* Activity Summary */}
            {profileData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              >
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Predictions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData.activity_summary.total_predictions}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Churn Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData.activity_summary.avg_churn_score.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">High Risk</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData.activity_summary.high_risk_predictions}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Age</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileData.activity_summary.account_age_days} days
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Profile Picture */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-1"
              >
                <Card className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {isEditing ? editForm.name : user.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {user.role}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isEditing ? editForm.company : user.company || 'No company specified'}
                  </p>
                </Card>
              </motion.div>

              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                  
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <div>
                          <Input
                            value={editForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            error={formErrors.name}
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{user.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <div>
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email address"
                            error={formErrors.email}
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Company Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Enter your company (optional)"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Building className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{user.company || 'No company specified'}</span>
                        </div>
                      )}
                    </div>

                    {/* Password Fields (only show when editing) */}
                    {isEditing && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password (optional)
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={editForm.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Enter new password"
                              error={formErrors.password}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {formErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Leave blank to keep current password. Must contain uppercase, lowercase, and numbers.
                          </p>
                        </div>

                        {editForm.password && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={editForm.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="Confirm new password"
                                error={formErrors.confirmPassword}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                            {formErrors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Read-only fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{user.role}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Join Date
                        </label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Churn Insights and Recent Predictions */}
            {profileData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
                {/* Churn Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Churn Insights
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Risk Level</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profileData.churn_insights.risk_level === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : profileData.churn_insights.risk_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {profileData.churn_insights.risk_level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Trend</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profileData.churn_insights.trend === 'increasing' 
                            ? 'bg-red-100 text-red-800' 
                            : profileData.churn_insights.trend === 'decreasing'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profileData.churn_insights.trend.toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {profileData.churn_insights.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Recent Predictions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Recent Predictions
                    </h3>
                    
                    {profileData.recent_predictions.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.recent_predictions.slice(0, 5).map((prediction) => (
                          <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Score: {prediction.churn_score.toFixed(3)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(prediction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prediction.risk_level === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : prediction.risk_level === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {prediction.risk_level}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No predictions available</p>
                        <p className="text-sm text-gray-400">Upload data to see churn predictions</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Loading State */}
            {profileLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile data...</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
