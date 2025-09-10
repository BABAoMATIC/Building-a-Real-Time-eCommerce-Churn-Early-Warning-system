'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters long')
      return
    }
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      showError('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const result = await register(
        formData.email,
        formData.password,
        fullName,
        formData.company
      )
      
      if (result.success) {
        showSuccess('Account created successfully! Welcome to ChurnGuard!')
        router.push('/dashboard')
      } else {
        showError(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </motion.button>
            
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ChurnGuard</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Get started with ChurnGuard today</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                icon={<User className="h-5 w-5" />}
                required
              />
              <Input
                label="Last name"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                icon={<User className="h-5 w-5" />}
                required
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="h-5 w-5" />}
              required
            />

            <Input
              label="Company"
              type="text"
              placeholder="Your company name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              icon={<Building className="h-5 w-5" />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                icon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              className="mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}