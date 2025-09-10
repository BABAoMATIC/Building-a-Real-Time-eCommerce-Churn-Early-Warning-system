'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authApi from '@/lib/authApi'

interface User {
  id: number
  email: string
  name: string
  company?: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, name: string, company?: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        if (storedToken) {
          setToken(storedToken)
          // Verify token and get user info
          const response = await authApi.verifyToken()
          if (response.success) {
            setUser(response.user)
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken')
            setToken(null)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(email, password)
      
      if (response.success) {
        setUser(response.user)
        setToken(response.access_token)
        localStorage.setItem('authToken', response.access_token)
        localStorage.setItem('refreshToken', response.refresh_token)
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, company?: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.register(email, password, name, company)
      
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true)
      const response = await authApi.updateProfile(data)
      
      if (response.success) {
        setUser(response.user)
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error) {
      return { success: false, message: 'Profile update failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error) {
      return { success: false, message: 'Password change failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
