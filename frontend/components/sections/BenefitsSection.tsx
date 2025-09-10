'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const benefits = [
  {
    icon: DollarSign,
    title: 'Increase Revenue',
    description: 'Reduce churn by up to 40% and increase customer lifetime value by 25%',
    metric: '+$2.5M',
    metricLabel: 'Annual Revenue Increase',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Boost Retention',
    description: 'Improve customer retention rates with proactive intervention strategies',
    metric: '85%',
    metricLabel: 'Retention Rate',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automate churn detection and reduce manual analysis time by 70%',
    metric: '40hrs',
    metricLabel: 'Saved Per Week',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: Users,
    title: 'Scale Operations',
    description: 'Handle thousands of customers with automated workflows and smart alerts',
    metric: '10K+',
    metricLabel: 'Customers Monitored',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  }
]

const features = [
  'Real-time churn risk scoring',
  'Automated customer segmentation',
  'Personalized retention campaigns',
  'Advanced analytics and reporting',
  'Integration with existing tools',
  '24/7 monitoring and alerts',
  'Customizable workflows',
  'Team collaboration features'
]

export default function BenefitsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="benefits" ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Churn Prevention Platform?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of companies that have transformed their customer retention strategy and achieved remarkable results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              <div className="flex items-start space-x-6">
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4">{benefit.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {benefit.metric}
                    </span>
                    <span className="text-sm text-gray-500">{benefit.metricLabel}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-gray-600">
              Our platform provides comprehensive tools and features to help you retain customers and grow your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </motion.button>
          <p className="text-gray-500 mt-4">No credit card required • 14-day free trial</p>
        </motion.div>
      </div>
    </section>
  )
}
