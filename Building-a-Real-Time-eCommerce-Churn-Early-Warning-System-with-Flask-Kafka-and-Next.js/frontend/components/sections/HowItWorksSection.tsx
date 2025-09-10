'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Database, 
  Brain, 
  Bell, 
  Target, 
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Database,
    title: 'Data Collection',
    description: 'We integrate with your existing systems to collect customer data from multiple sources including CRM, support tickets, and behavioral analytics.',
    details: [
      'Connect to your CRM system',
      'Import customer interaction data',
      'Set up real-time data feeds',
      'Configure data privacy settings'
    ],
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our advanced machine learning algorithms analyze customer behavior patterns to identify early warning signs of potential churn.',
    details: [
      'Behavioral pattern analysis',
      'Risk score calculation',
      'Predictive modeling',
      'Continuous learning and improvement'
    ],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    step: '03',
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get instant notifications when customers show signs of churn risk, with actionable insights and recommended interventions.',
    details: [
      'Real-time risk alerts',
      'Customizable notification rules',
      'Priority-based escalation',
      'Team collaboration features'
    ],
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    step: '04',
    icon: Target,
    title: 'Take Action',
    description: 'Execute targeted retention campaigns with personalized offers and interventions to prevent customer churn.',
    details: [
      'Automated campaign triggers',
      'Personalized offer generation',
      'A/B testing capabilities',
      'Performance tracking and optimization'
    ],
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  }
]

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our four-step process makes it easy to implement and start preventing customer churn in just a few days.
          </p>
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Step {step.step}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detail}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, delay: (index * 0.2) + 0.3 + (detailIndex * 0.1) }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`w-full h-80 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
                      <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-full"></div>
                      <div className="absolute bottom-8 left-8 w-12 h-12 bg-white rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4">
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-white text-2xl font-bold mb-2">Step {step.step}</div>
                        <div className="text-white/80 text-lg">{step.title}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                  >
                    <Play className="w-5 h-5 text-white ml-1" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies that have already transformed their customer retention strategy.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
