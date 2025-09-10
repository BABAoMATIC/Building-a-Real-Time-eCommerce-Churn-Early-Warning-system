'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingVariants = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5 md:p-6',
  lg: 'p-5 sm:p-6 md:p-8'
}

const shadowVariants = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'sm'
}: CardProps) {
  const baseClasses = 'bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/60 transition-all duration-200'
  const paddingClasses = paddingVariants[padding]
  const shadowClasses = shadowVariants[shadow]
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : ''
  
  const combinedClasses = `${baseClasses} ${paddingClasses} ${shadowClasses} ${hoverClasses} ${className}`.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={combinedClasses}
    >
      {children}
    </motion.div>
  )
}
