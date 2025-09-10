/**
 * Simple Direct Authentication API
 * Bypasses all complex layers and works directly with fetch
 */

const API_BASE_URL = 'http://localhost:5000'

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: any
  error?: string
}

export const simpleAuth = {
  async register(email: string, password: string, name: string, company?: string): Promise<AuthResponse> {
    try {
      console.log('Simple Auth: Registering user:', { email, name })
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          company
        })
      })

      console.log('Simple Auth: Response status:', response.status)
      console.log('Simple Auth: Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Simple Auth: Response data:', data)

      if (response.ok) {
        // Store token and user data
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user))
        }
        
        return {
          success: true,
          message: data.message || 'Registration successful',
          token: data.token,
          user: data.user
        }
      } else {
        return {
          success: false,
          message: data.error || 'Registration failed',
          error: data.error
        }
      }
    } catch (error: any) {
      console.error('Simple Auth: Registration error:', error)
      return {
        success: false,
        message: error.message || 'Network error during registration',
        error: error.message
      }
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Simple Auth: Logging in user:', { email })
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      console.log('Simple Auth: Login response status:', response.status)
      const data = await response.json()
      console.log('Simple Auth: Login response data:', data)

      if (response.ok) {
        // Store token and user data
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user))
        }
        
        return {
          success: true,
          message: data.message || 'Login successful',
          token: data.token,
          user: data.user
        }
      } else {
        return {
          success: false,
          message: data.error || 'Login failed',
          error: data.error
        }
      }
    } catch (error: any) {
      console.error('Simple Auth: Login error:', error)
      return {
        success: false,
        message: error.message || 'Network error during login',
        error: error.message
      }
    }
  },

  async getProfile(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          error: 'No token'
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: 'Profile retrieved successfully',
          user: data.user
        }
      } else {
        return {
          success: false,
          message: data.error || 'Failed to get profile',
          error: data.error
        }
      }
    } catch (error: any) {
      console.error('Simple Auth: Profile error:', error)
      return {
        success: false,
        message: error.message || 'Network error during profile fetch',
        error: error.message
      }
    }
  },

  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    return !!token
  },

  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  getUser(): any | null {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  }
}
