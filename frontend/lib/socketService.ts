import { io, Socket } from 'socket.io-client'

interface DashboardData {
  user_id: number
  timestamp: string
  metrics: {
    total_predictions: number
    avg_churn_score: number
    high_risk_predictions: number
    low_risk_predictions: number
    medium_risk_predictions: number
    engagement_score: number
    retention_rate: number
    active_users_today: number
    new_predictions_today: number
  }
  recent_activity: Array<{
    id: string
    user_id: string
    churn_score: number
    risk_level: string
    timestamp: string
    file_name?: string
    status: string
  }>
  trends: {
    churn_trend: string
    engagement_trend: string
    retention_trend: string
  }
  alerts: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

interface SocketServiceCallbacks {
  onDashboardUpdate?: (data: DashboardData) => void
  onSystemAlert?: (alert: any) => void
  onNewPrediction?: (prediction: any) => void
  onConnected?: (status: string) => void
  onDisconnected?: () => void
  onError?: (error: string) => void
}

class SocketService {
  private socket: Socket | null = null
  private callbacks: SocketServiceCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.requestDashboardData = this.requestDashboardData.bind(this)
    this.sendUserAction = this.sendUserAction.bind(this)
  }

  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        
        this.socket = io(API_BASE_URL, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        })

        // Connection event handlers
        this.socket.on('connect', () => {
          console.log('Connected to Socket.IO server')
          this.reconnectAttempts = 0
          this.callbacks.onConnected?.('success')
          resolve(true)
        })

        this.socket.on('connected', (data: { status: string; message: string }) => {
          if (data.status === 'success') {
            console.log('Socket.IO authentication successful')
            resolve(true)
          } else {
            console.error('Socket.IO authentication failed:', data.message)
            this.callbacks.onError?.(data.message)
            reject(new Error(data.message))
          }
        })

        this.socket.on('disconnect', (reason: string) => {
          console.log('Disconnected from Socket.IO server:', reason)
          this.callbacks.onDisconnected?.()
        })

        this.socket.on('connect_error', (error: Error) => {
          console.error('Socket.IO connection error:', error)
          this.reconnectAttempts++
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.callbacks.onError?.('Connection failed after multiple attempts')
            reject(error)
          }
        })

        // Data event handlers
        this.socket.on('dashboard_update', (data: DashboardData) => {
          console.log('Received dashboard update:', data)
          this.callbacks.onDashboardUpdate?.(data)
        })

        this.socket.on('system_alert', (alert: any) => {
          console.log('Received system alert:', alert)
          this.callbacks.onSystemAlert?.(alert)
        })

        this.socket.on('new_prediction', (prediction: any) => {
          console.log('Received new prediction:', prediction)
          this.callbacks.onNewPrediction?.(prediction)
        })

        this.socket.on('error', (error: { message: string }) => {
          console.error('Socket.IO error:', error.message)
          this.callbacks.onError?.(error.message)
        })

        // Legacy support
        this.socket.on('live_data_update', (data: any) => {
          console.log('Received legacy live data update:', data)
          // Convert legacy format to new format if needed
          this.callbacks.onDashboardUpdate?.(data)
        })

      } catch (error) {
        console.error('Error connecting to Socket.IO:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Disconnected from Socket.IO server')
    }
  }

  requestDashboardData(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('request_dashboard_data')
    } else {
      console.warn('Socket not connected, cannot request dashboard data')
    }
  }

  sendUserAction(action: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('user_action', {
        action,
        data,
        timestamp: new Date().toISOString()
      })
    } else {
      console.warn('Socket not connected, cannot send user action')
    }
  }

  // Callback setters
  setCallbacks(callbacks: SocketServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Get connection status
  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected'
    if (this.socket.connected) return 'connected'
    return 'connecting'
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
export type { DashboardData, SocketServiceCallbacks }
