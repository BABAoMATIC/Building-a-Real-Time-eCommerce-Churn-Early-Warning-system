'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, X, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorMessageProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
  className?: string
}

const typeClasses = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700'
  }
}

export default function ErrorMessage({ 
  title = 'Error',
  message, 
  type = 'error',
  onRetry,
  onDismiss,
  showDismiss = true,
  className = '' 
}: ErrorMessageProps) {
  const typeClass = typeClasses[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${typeClass.container} ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${typeClass.icon}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${typeClass.title}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${typeClass.message}`}>
            {message}
          </p>
          {(onRetry || onDismiss) && (
            <div className="flex items-center space-x-3 mt-3">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && showDismiss && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDismiss}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
