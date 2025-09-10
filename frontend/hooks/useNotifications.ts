'use client'

import { toast } from 'react-toastify'

export interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  autoClose?: boolean
  hideProgressBar?: boolean
  closeOnClick?: boolean
  pauseOnHover?: boolean
  draggable?: boolean
}

const defaultOptions: NotificationOptions = {
  type: 'info',
  duration: 5000,
  position: 'top-right',
  autoClose: true,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
}

export const useNotifications = () => {
  const showNotification = (message: string, options: NotificationOptions = {}) => {
    const config = { ...defaultOptions, ...options }
    
    switch (config.type) {
      case 'success':
        toast.success(message, {
          position: config.position,
          autoClose: config.autoClose ? config.duration : false,
          hideProgressBar: config.hideProgressBar,
          closeOnClick: config.closeOnClick,
          pauseOnHover: config.pauseOnHover,
          draggable: config.draggable,
        })
        break
      case 'error':
        toast.error(message, {
          position: config.position,
          autoClose: config.autoClose ? config.duration : false,
          hideProgressBar: config.hideProgressBar,
          closeOnClick: config.closeOnClick,
          pauseOnHover: config.pauseOnHover,
          draggable: config.draggable,
        })
        break
      case 'warning':
        toast.warning(message, {
          position: config.position,
          autoClose: config.autoClose ? config.duration : false,
          hideProgressBar: config.hideProgressBar,
          closeOnClick: config.closeOnClick,
          pauseOnHover: config.pauseOnHover,
          draggable: config.draggable,
        })
        break
      case 'info':
      default:
        toast.info(message, {
          position: config.position,
          autoClose: config.autoClose ? config.duration : false,
          hideProgressBar: config.hideProgressBar,
          closeOnClick: config.closeOnClick,
          pauseOnHover: config.pauseOnHover,
          draggable: config.draggable,
        })
        break
    }
  }

  const showSuccess = (message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'success' })
  }

  const showError = (message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'error' })
  }

  const showWarning = (message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'warning' })
  }

  const showInfo = (message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'info' })
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissAll
  }
}
