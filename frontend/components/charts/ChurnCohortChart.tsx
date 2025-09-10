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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface CohortData {
  cohort: string
  churnRate: number
  userCount: number
}

interface ChurnCohortChartProps {
  data: CohortData[]
}

export default function ChurnCohortChart({ data }: ChurnCohortChartProps) {
  const chartData = {
    labels: data.map(item => item.cohort),
    datasets: [
      {
        label: 'Churn Rate (%)',
        data: data.map(item => item.churnRate),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: function(context: any) {
            return `Cohort: ${context[0].label}`
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const dataIndex = context.dataIndex
            const userCount = data[dataIndex].userCount
            return [
              `Churn Rate: ${context.parsed.y}%`,
              `Users: ${userCount.toLocaleString()}`
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Churn Rate by Cohort
          </h3>
          <p className="text-sm text-gray-600">
            Monthly churn rates across different user cohorts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Churn Rate</span>
        </div>
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200"
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.userCount, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {(data.reduce((sum, item) => sum + item.churnRate, 0) / data.length).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Avg Churn Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {Math.max(...data.map(item => item.churnRate)).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Highest Churn</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.min(...data.map(item => item.churnRate)).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Lowest Churn</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
