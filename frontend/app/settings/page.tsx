'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Settings, User, Bell, Shield, Database, Palette, Save, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import FileUploadComponent from '@/components/upload/FileUploadComponent'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corp',
      role: 'Admin'
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      weeklyReports: false,
      churnAlerts: true,
      systemAlerts: true
    },
    system: {
      autoRefresh: true,
      refreshInterval: 30,
      dataRetention: 365,
      maxUsers: 10000
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data-upload', label: 'Data Upload', icon: Upload }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const handleInputChange = (section: string, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadFile(file)
      setUploadStatus('idle')
      setUploadMessage('')
    }
  }

  const handleFileSubmit = async () => {
    if (!uploadFile) return

    setUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)

      const response = await fetch('http://localhost:5000/api/upload-data', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setUploadMessage(`File processed successfully! ${result.predictions_count} predictions generated.`)
        setUploadFile(null)
      } else {
        setUploadStatus('error')
        setUploadMessage(result.error || 'Upload failed')
      }
    } catch {
      setUploadStatus('error')
      setUploadMessage('Network error. Please check if the backend server is running.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />
      
      <main className="pt-24 min-h-screen">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="mb-4 sm:mb-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-r from-gray-500 to-blue-600 rounded-2xl shadow-lg"
                  >
                    <Settings className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                    >
                      Settings
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 text-sm sm:text-base md:text-lg font-medium"
                    >
                      ⚙️ Configure your system preferences
                    </motion.p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  icon={<Save className="h-4 w-4" />}
                  iconPosition="left"
                >
                  Save Changes
                </Button>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Sidebar Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-1"
              >
                <Card className="p-4 sm:p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </Card>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-3"
              >
                <Card className="p-4 sm:p-6">
                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Full Name"
                            value={settings.profile.name}
                            onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                          />
                          <Input
                            label="Email"
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                          />
                          <Input
                            label="Company"
                            value={settings.profile.company}
                            onChange={(e) => handleInputChange('profile', 'company', e.target.value)}
                          />
                          <Input
                            label="Role"
                            value={settings.profile.role}
                            onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                          {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-gray-900 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <p className="text-sm text-gray-500">
                                  {key === 'emailAlerts' && 'Receive email notifications for important events'}
                                  {key === 'pushNotifications' && 'Show browser push notifications'}
                                  {key === 'weeklyReports' && 'Get weekly summary reports via email'}
                                  {key === 'churnAlerts' && 'Alert when high churn risk is detected'}
                                  {key === 'systemAlerts' && 'Notify about system issues and maintenance'}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Settings */}
                  {activeTab === 'system' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-900">Auto Refresh</label>
                              <p className="text-sm text-gray-500">Automatically refresh dashboard data</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.system.autoRefresh}
                                onChange={(e) => handleInputChange('system', 'autoRefresh', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-900">Refresh Interval (seconds)</label>
                            <input
                              type="number"
                              value={settings.system.refreshInterval}
                              onChange={(e) => handleInputChange('system', 'refreshInterval', parseInt(e.target.value))}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="10"
                              max="300"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-900">Data Retention (days)</label>
                            <input
                              type="number"
                              value={settings.system.dataRetention}
                              onChange={(e) => handleInputChange('system', 'dataRetention', parseInt(e.target.value))}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="30"
                              max="3650"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-900">Max Users</label>
                            <input
                              type="number"
                              value={settings.system.maxUsers}
                              onChange={(e) => handleInputChange('system', 'maxUsers', parseInt(e.target.value))}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="100"
                              max="100000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance Settings */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance & Localization</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-900">Theme</label>
                            <select
                              value={settings.appearance.theme}
                              onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-900">Language</label>
                            <select
                              value={settings.appearance.language}
                              onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-900">Timezone</label>
                            <select
                              value={settings.appearance.timezone}
                              onChange={(e) => handleInputChange('appearance', 'timezone', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="UTC">UTC</option>
                              <option value="EST">Eastern Time</option>
                              <option value="PST">Pacific Time</option>
                              <option value="GMT">Greenwich Mean Time</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">Password</h4>
                            <p className="text-sm text-yellow-700 mb-3">Last changed 30 days ago</p>
                            <Button variant="outline" size="sm">
                              Change Password
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Two-Factor Authentication</h4>
                            <p className="text-sm text-blue-700 mb-3">Add an extra layer of security to your account</p>
                            <Button variant="outline" size="sm">
                              Enable 2FA
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="text-sm font-medium text-green-800 mb-2">API Keys</h4>
                            <p className="text-sm text-green-700 mb-3">Manage your API access keys</p>
                            <Button variant="outline" size="sm">
                              Manage Keys
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Upload Settings */}
                  {activeTab === 'data-upload' && (
                    <FileUploadComponent
                      onUploadSuccess={(result) => {
                        toast.success(result.message, {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        })
                      }}
                      onUploadError={(error) => {
                        toast.error(error, {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        })
                      }}
                    />
                  )}
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </ProtectedRoute>
  )
}
