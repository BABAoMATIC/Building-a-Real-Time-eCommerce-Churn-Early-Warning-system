'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const colorClasses = {
  blue: 'border-blue-600',
  green: 'border-green-600',
  red: 'border-red-600',
  gray: 'border-gray-600',
  white: 'border-white'
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-current rounded-full ${colorClasses[color]}`}
        />
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  )
}
