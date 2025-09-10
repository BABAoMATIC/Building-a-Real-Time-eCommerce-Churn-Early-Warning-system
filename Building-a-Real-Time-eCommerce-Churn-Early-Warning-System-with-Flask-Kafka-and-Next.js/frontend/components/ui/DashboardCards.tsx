'use client'

import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  averageChurnRisk: number
  highRiskUsers: number
  churnRateChange: number
}

interface DashboardCardsProps {
  stats: DashboardStats
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Average Churn Risk',
      value: `${stats.averageChurnRisk}%`,
      change: stats.churnRateChange > 0 ? `+${stats.churnRateChange}%` : `${stats.churnRateChange}%`,
      trend: stats.churnRateChange > 0 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      changeColor: stats.churnRateChange > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'High-Risk Users',
      value: stats.highRiskUsers.toLocaleString(),
      change: '+8.3%',
      trend: 'up' as const,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      changeColor: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <motion.p 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                {card.value}
              </motion.p>
              <div className="flex items-center">
                {card.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                )}
                <span className={`text-sm font-medium ${card.changeColor}`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
              className={`p-3 rounded-full ${card.bgColor}`}
            >
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </motion.div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
            className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: card.title === 'Total Users' ? '85%' : 
                       card.title === 'Average Churn Risk' ? `${Math.min(stats.averageChurnRisk, 100)}%` : 
                       '65%'
              }}
              transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
              className={`h-full ${
                card.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                card.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              } rounded-full`}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
