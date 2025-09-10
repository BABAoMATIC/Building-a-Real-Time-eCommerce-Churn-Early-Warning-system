'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setShowFallback(true)
      }
    }
  }, [isAuthenticated, isLoading])

  const handleLogin = () => {
    router.push('/login')
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated && showFallback) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this feature. Our real-time dashboard, 
            analytics, and AI-powered predictions require authentication.
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={handleSignup}
              variant="outline"
              className="w-full"
            >
              Create Account
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Back to Home
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure authentication with JWT tokens</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
