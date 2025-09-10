'use client'

import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, TrendingDown, Activity, Loader2, Sparkles, Zap, Shield, Heart, Star, Rocket } from 'lucide-react'

interface User {
  user_id: string;
  churn_score: number;
  cohort: string;
  name?: string;
  email?: string;
  risk_level?: string;
}

interface EnhancedDashboardCardsProps {
  users: User[];
  isLoading?: boolean;
}

export default function EnhancedDashboardCards({ users, isLoading = false }: EnhancedDashboardCardsProps) {
  // Calculate stats from users data
  const totalUsers = users.length;
  const averageChurnScore = users.length > 0 
    ? (users.reduce((sum, user) => sum + user.churn_score, 0) / users.length) * 100
    : 0;
  const highRiskUsers = users.filter(user => user.churn_score > 0.7).length;

  const cards = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      secondaryIcon: Sparkles,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      bgGradient: 'from-blue-50 via-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-r from-blue-500 to-purple-600',
      iconColor: 'text-white',
      changeColor: 'text-green-600',
      description: 'Total registered users',
      progress: 85,
      emoji: '👥',
      sparkle: true
    },
    {
      title: 'Average Churn Score',
      value: `${averageChurnScore.toFixed(1)}%`,
      change: averageChurnScore > 50 ? '+5.2%' : '-2.1%',
      trend: averageChurnScore > 50 ? 'up' as const : 'down' as const,
      icon: Activity,
      secondaryIcon: Zap,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgGradient: 'from-orange-50 via-red-50 to-pink-50',
      iconBg: 'bg-gradient-to-r from-orange-500 to-red-600',
      iconColor: 'text-white',
      changeColor: averageChurnScore > 50 ? 'text-red-600' : 'text-green-600',
      description: 'Average churn risk across all users',
      progress: Math.min(averageChurnScore, 100),
      emoji: '📊',
      sparkle: false
    },
    {
      title: 'High-Risk Users',
      value: highRiskUsers.toLocaleString(),
      change: '+8.3%',
      trend: 'up' as const,
      icon: AlertTriangle,
      secondaryIcon: Shield,
      gradient: 'from-red-500 via-pink-500 to-purple-500',
      bgGradient: 'from-red-50 via-pink-50 to-purple-50',
      iconBg: 'bg-gradient-to-r from-red-500 to-pink-600',
      iconColor: 'text-white',
      changeColor: 'text-red-600',
      description: 'Users with churn score > 70%',
      progress: totalUsers > 0 ? (highRiskUsers / totalUsers) * 100 : 0,
      emoji: '⚠️',
      sparkle: false
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 50, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.15, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.05,
            y: -8,
            rotateY: 5,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-hard transition-all duration-500 group border border-white/20 backdrop-blur-sm p-4 sm:p-6`}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating orbs */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-full opacity-20 blur-sm`}
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${20 + i * 15}%`,
                }}
              />
            ))}
            
            {/* Sparkle effects */}
            {card.sparkle && [...Array(6)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${25 + i * 10}%`,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {/* Header with emoji and title */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.2 
                  }}
                  className="text-3xl"
                >
                  {card.emoji}
                </motion.span>
                <div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-lg font-bold text-gray-800"
                  >
                    {card.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-sm text-gray-600"
                  >
                    {card.description}
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Icon with gradient background */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.4 + index * 0.1, 
                  type: 'spring', 
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className={`p-4 rounded-2xl ${card.iconBg} shadow-lg group-hover:shadow-xl transition-all duration-300`}
              >
                <card.icon className={`h-8 w-8 ${card.iconColor}`} />
              </motion.div>
            </div>
            
            {/* Main value */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.5 + index * 0.1, 
                type: "spring", 
                stiffness: 200,
                damping: 15
              }}
              className="mb-4 sm:mb-6"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              ) : (
                <motion.h2 
                  className="text-4xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  {card.value}
                </motion.h2>
              )}
            </motion.div>
            
            {/* Trend indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between mb-4 sm:mb-6"
            >
              <div className="flex items-center space-x-2">
                {card.trend === 'up' ? (
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
                <span className={`text-sm font-bold ${card.changeColor}`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-600">vs last month</span>
              </div>
              
              {/* Secondary icon */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="opacity-60"
              >
                <card.secondaryIcon className="h-5 w-5 text-gray-500" />
              </motion.div>
            </motion.div>
            
            {/* Enhanced Progress bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
              className="mb-4"
            >
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                <span>Progress</span>
                <span>{card.progress}%</span>
              </div>
              <div className="h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.progress}%` }}
                  transition={{ 
                    delay: 0.9 + index * 0.1, 
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                  className={`h-full bg-gradient-to-r ${card.gradient} rounded-full relative overflow-hidden shadow-lg`}
                >
                  {/* Animated shimmer */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      delay: 1.5 + index * 0.1,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Additional metrics for high-risk users card */}
            {card.title === 'High-Risk Users' && totalUsers > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="pt-4 border-t border-white/30"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Risk Rate</span>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span className="text-sm font-bold text-red-600">
                      {((highRiskUsers / totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
