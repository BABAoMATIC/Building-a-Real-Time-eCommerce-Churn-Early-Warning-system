'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Brain, 
  Zap, 
  BarChart3, 
  Shield, 
  Clock, 
  Target,
  Database,
  Bell,
  TrendingUp,
  Users,
  Settings,
  Globe
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    description: 'Advanced machine learning algorithms analyze customer behavior patterns to predict churn risk with 95% accuracy.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: Zap,
    title: 'Real-Time Monitoring',
    description: 'Continuous monitoring of customer interactions and behavior changes with instant alerts and notifications.',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and reports providing deep insights into customer behavior and churn patterns.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade security with end-to-end encryption and compliance with GDPR and SOC 2 standards.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Round-the-clock monitoring and support ensuring your customer retention efforts never sleep.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Identify specific customer segments and create targeted retention campaigns for maximum effectiveness.',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600'
  }
]

const additionalFeatures = [
  { icon: Database, text: 'Multi-source data integration' },
  { icon: Bell, text: 'Smart alert system' },
  { icon: TrendingUp, text: 'Performance tracking' },
  { icon: Users, text: 'Team collaboration tools' },
  { icon: Settings, text: 'Customizable workflows' },
  { icon: Globe, text: 'Global deployment ready' }
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Churn Prevention
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides everything you need to identify, analyze, and prevent customer churn with cutting-edge technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              And Much More
            </h3>
            <p className="text-gray-600">
              Additional features that make our platform the complete solution for customer retention.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="flex items-center space-x-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
