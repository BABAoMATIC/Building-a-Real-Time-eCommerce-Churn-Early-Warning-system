'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
}

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600'
}

export default function ProgressBar({ 
  progress, 
  size = 'md', 
  color = 'blue', 
  showPercentage = true,
  text,
  className = '' 
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full ${className}`}>
      {text && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{text}</span>
          {showPercentage && (
            <span>{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {!text && showPercentage && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  )
}
