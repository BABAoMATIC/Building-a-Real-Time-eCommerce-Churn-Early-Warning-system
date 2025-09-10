'use client'

import { motion } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import Button from './Button'

interface SuccessMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  showDismiss?: boolean
  className?: string
}

export default function SuccessMessage({ 
  title = 'Success',
  message, 
  onDismiss,
  showDismiss = true,
  className = '' 
}: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border bg-green-50 border-green-200 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-green-800">
            {title}
          </h3>
          <p className="text-sm mt-1 text-green-700">
            {message}
          </p>
          {onDismiss && showDismiss && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
