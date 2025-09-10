'use client'

import { motion } from 'framer-motion'
import { Bell, Search, User, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'High churn risk detected',
      message: 'Customer John Smith shows 85% churn probability',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Payment failure',
      message: 'Payment failed for customer Jane Doe',
      time: '15 minutes ago',
      unread: true
    },
    {
      id: 3,
      title: 'New user registered',
      message: 'Mike Johnson has joined the platform',
      time: '1 hour ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-6 lg:ml-64 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 max-w-2xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, alerts, or analytics..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </motion.div>

        {/* Right side actions */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">You have {unreadCount} unread notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-3 font-medium">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* User menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </motion.button>

            {/* User dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-50"
              >
                <div className="p-6 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500 mt-1">john.doe@example.com</p>
                </div>
                <div className="py-3">
                  <button className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <User className="h-5 w-5 mr-4" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <Settings className="h-5 w-5 mr-4" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <hr className="my-3 mx-6" />
                  <button className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                    <LogOut className="h-5 w-5 mr-4" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
