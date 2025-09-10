'use client'

import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Loader2, BarChart3, TrendingUp, Users, AlertTriangle, Sparkles, Zap, Target } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface User {
  user_id: string;
  churn_score: number;
  cohort: string;
  name?: string;
  email?: string;
  risk_level?: string;
}

interface ChurnDistributionChartProps {
  users: User[];
  isLoading?: boolean;
}

export default function ChurnDistributionChart({ users, isLoading = false }: ChurnDistributionChartProps) {
  // Process data to get cohort distribution
  const cohortData = users.reduce((acc, user) => {
    const cohort = user.cohort || 'Unknown';
    if (!acc[cohort]) {
      acc[cohort] = {
        totalUsers: 0,
        totalChurnScore: 0,
        highRiskUsers: 0
      };
    }
    acc[cohort].totalUsers += 1;
    acc[cohort].totalChurnScore += user.churn_score;
    if (user.churn_score > 0.7) {
      acc[cohort].highRiskUsers += 1;
    }
    return acc;
  }, {} as Record<string, { totalUsers: number; totalChurnScore: number; highRiskUsers: number }>);

  // Convert to chart data
  const chartData = Object.entries(cohortData).map(([cohort, data]) => ({
    cohort,
    averageChurnScore: (data.totalChurnScore / data.totalUsers) * 100,
    totalUsers: data.totalUsers,
    highRiskUsers: data.highRiskUsers,
    highRiskPercentage: (data.highRiskUsers / data.totalUsers) * 100
  })).sort((a, b) => b.averageChurnScore - a.averageChurnScore);

  const chartConfig = {
    labels: chartData.map(item => item.cohort),
    datasets: [
      {
        label: 'Average Churn Score (%)',
        data: chartData.map(item => item.averageChurnScore),
        backgroundColor: chartData.map((_, index) => {
          const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
            'rgba(250, 112, 154, 0.8)',
            'rgba(168, 237, 234, 0.8)',
            'rgba(255, 154, 158, 0.8)',
            'rgba(255, 236, 210, 0.8)',
          ];
          return colors[index % colors.length];
        }),
        borderColor: chartData.map((_, index) => {
          const colors = [
            'rgba(102, 126, 234, 1)',
            'rgba(240, 147, 251, 1)',
            'rgba(79, 172, 254, 1)',
            'rgba(67, 233, 123, 1)',
            'rgba(250, 112, 154, 1)',
            'rgba(168, 237, 234, 1)',
            'rgba(255, 154, 158, 1)',
            'rgba(255, 236, 210, 1)',
          ];
          return colors[index % colors.length];
        }),
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: chartData.map((_, index) => {
          const colors = [
            'rgba(102, 126, 234, 0.9)',
            'rgba(240, 147, 251, 0.9)',
            'rgba(79, 172, 254, 0.9)',
            'rgba(67, 233, 123, 0.9)',
            'rgba(250, 112, 154, 0.9)',
            'rgba(168, 237, 234, 0.9)',
            'rgba(255, 154, 158, 0.9)',
            'rgba(255, 236, 210, 0.9)',
          ];
          return colors[index % colors.length];
        }),
        hoverBorderWidth: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: function(context: any) {
            return `Cohort: ${context[0].label}`
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const dataIndex = context.dataIndex
            const data = chartData[dataIndex]
            return [
              `Average Churn Score: ${context.parsed.y.toFixed(1)}%`,
              `Total Users: ${data.totalUsers.toLocaleString()}`,
              `High-Risk Users: ${data.highRiskUsers.toLocaleString()} (${data.highRiskPercentage.toFixed(1)}%)`
            ]
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          callback: function(value: number | string) {
            return value + '%'
          }
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  }

  // Calculate summary statistics
  const totalUsers = chartData.reduce((sum, item) => sum + item.totalUsers, 0);
  const averageChurnScore = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.averageChurnScore, 0) / chartData.length 
    : 0;
  const highestChurnCohort = chartData.length > 0 ? chartData[0] : null;
  const totalHighRiskUsers = chartData.reduce((sum, item) => sum + item.highRiskUsers, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl shadow-soft border border-white/20 backdrop-blur-sm p-4 sm:p-6"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg"
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
              >
                📊 Churn Distribution by Cohort
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm sm:text-base text-gray-600 font-medium"
              >
                🎯 Average churn scores across different user cohorts
              </motion.p>
            </div>
          </div>
          
            <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center space-x-2 sm:space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">Churn Score</span>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
            </motion.div>
          </motion.div>
        </div>
      
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 flex items-center justify-center"
        >
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        </motion.div>
      ) : chartData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 flex items-center justify-center"
        >
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cohort data available</p>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="h-64 sm:h-72 lg:h-80"
          >
            <Bar data={chartConfig} options={options} />
          </motion.div>
          
          {/* Enhanced Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/30"
          >
            {[
              {
                icon: Users,
                value: totalUsers.toLocaleString(),
                label: 'Total Users',
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                emoji: '👥',
                delay: 1.1
              },
              {
                icon: TrendingUp,
                value: `${averageChurnScore.toFixed(1)}%`,
                label: 'Avg Churn Score',
                gradient: 'from-orange-500 to-red-500',
                bgGradient: 'from-orange-50 to-red-50',
                emoji: '📈',
                delay: 1.2
              },
              {
                icon: Target,
                value: highestChurnCohort ? `${highestChurnCohort.averageChurnScore.toFixed(1)}%` : '0%',
                label: 'Highest Churn',
                gradient: 'from-red-500 to-pink-500',
                bgGradient: 'from-red-50 to-pink-50',
                emoji: '🎯',
                delay: 1.3,
                subtitle: highestChurnCohort?.cohort
              },
              {
                icon: AlertTriangle,
                value: totalHighRiskUsers.toLocaleString(),
                label: 'High-Risk Users',
                gradient: 'from-purple-500 to-indigo-500',
                bgGradient: 'from-purple-50 to-indigo-50',
                emoji: '⚠️',
                delay: 1.4,
                subtitle: `${totalUsers > 0 ? ((totalHighRiskUsers / totalUsers) * 100).toFixed(1) : '0'}% of total`
              }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: stat.delay, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                {/* Animated background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.2 
                      }}
                      className="text-2xl mr-2"
                    >
                      {stat.emoji}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-2 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-md`}
                    >
                      <stat.icon className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                  
                  <motion.p 
                    className="text-2xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: stat.delay + 0.2, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                  
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {stat.label}
                  </p>
                  
                  {stat.subtitle && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: stat.delay + 0.3 }}
                      className="text-xs text-gray-600 font-medium"
                    >
                      {stat.subtitle}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
      </div>
    </motion.div>
  )
}
