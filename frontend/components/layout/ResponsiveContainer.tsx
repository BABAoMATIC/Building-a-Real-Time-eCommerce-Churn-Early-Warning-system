'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function ResponsiveContainer({ 
  children, 
  className = '', 
  delay = 0 
}: ResponsiveContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 6,
  className = ''
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const { default: defaultCols, sm, md, lg, xl } = cols
    return [
      `grid-cols-${defaultCols}`,
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`
    ].filter(Boolean).join(' ')
  }

  return (
    <div className={`grid ${getGridCols()} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function ResponsiveCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0
}: ResponsiveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -2,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      } : {}}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-lg' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption'
  className?: string
  delay?: number
}

export function ResponsiveText({ 
  children, 
  variant = 'body',
  className = '',
  delay = 0
}: ResponsiveTextProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'
      case 'h2':
        return 'text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'
      case 'h3':
        return 'text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900'
      case 'h4':
        return 'text-base sm:text-lg lg:text-xl font-semibold text-gray-900'
      case 'body':
        return 'text-sm sm:text-base text-gray-600'
      case 'caption':
        return 'text-xs sm:text-sm text-gray-500'
      default:
        return 'text-base text-gray-900'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`${getVariantClasses()} ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Responsive Button Component
interface ResponsiveButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  delay?: number
}

export function ResponsiveButton({ 
  children, 
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  delay = 0
}: ResponsiveButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
      case 'outline':
        return 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
      case 'ghost':
        return 'text-gray-600 hover:bg-gray-100 focus:ring-blue-500'
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-sm sm:text-base'
      case 'lg':
        return 'px-6 py-3 text-base sm:text-lg'
      default:
        return 'px-4 py-2 text-sm sm:text-base'
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      <span>{children}</span>
    </motion.button>
  )
}
