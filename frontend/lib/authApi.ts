import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance for auth API
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  timeout: 10000,
})

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          })

          const { access_token } = response.data
          localStorage.setItem('authToken', access_token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return authApi(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

const authApiService = {
  // Register new user
  register: async (email: string, password: string, name: string, company?: string) => {
    const response = await authApi.post('/register', {
      email,
      password,
      name,
      company
    })
    return response.data
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await authApi.post('/login', {
      email,
      password
    })
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await authApi.post('/refresh', {
      refresh_token: refreshToken
    })
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await authApi.get('/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await authApi.put('/profile', data)
    return response.data
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await authApi.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  // Verify token
  verifyToken: async () => {
    const response = await authApi.get('/verify')
    return response.data
  },

  // Get all users (admin only)
  getUsers: async () => {
    const response = await authApi.get('/users')
    return response.data
  },

  // Get comprehensive user profile with churn data
  getUserProfile: async () => {
    const response = await authApi.get('/user/profile')
    return response.data
  },

  // Get user's churn predictions
  getUserPredictions: async (page = 1, limit = 20) => {
    const response = await authApi.get(`/user/predictions?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await authApi.get('/user/stats')
    return response.data
  },

  // Update user profile
  updateUserProfile: async (data: {
    name?: string
    email?: string
    password?: string
    company?: string
  }) => {
    const response = await authApi.put('/user/update-profile', data)
    return response.data
  },

  // Upload data file
  uploadData: async (formData: FormData) => {
    const response = await authApi.post('/upload-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Cohorts API
  getCohorts: async () => {
    const response = await authApi.get('/cohorts')
    return response.data
  },

  createCohort: async (data: any) => {
    const response = await authApi.post('/cohorts', data)
    return response.data
  },

  getCohort: async (cohortId: number) => {
    const response = await authApi.get(`/cohorts/${cohortId}`)
    return response.data
  },

  updateCohort: async (cohortId: number, data: any) => {
    const response = await authApi.put(`/cohorts/${cohortId}`, data)
    return response.data
  },

  deleteCohort: async (cohortId: number) => {
    const response = await authApi.delete(`/cohorts/${cohortId}`)
    return response.data
  },

  recalculateCohort: async (cohortId: number) => {
    const response = await authApi.post(`/cohorts/${cohortId}/recalculate`)
    return response.data
  },

  filterCohorts: async (filters: { engagement_level?: string; churn_risk_level?: string }) => {
    const response = await authApi.post('/cohorts/filter', filters)
    return response.data
  }
}

export default authApiService
