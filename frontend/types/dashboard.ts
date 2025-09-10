export interface User {
  id: number
  name: string
  email: string
  churnRisk: number
  cohort: string
}

export interface DashboardStats {
  totalUsers: number
  averageChurnRisk: number
  highRiskUsers: number
  churnRateChange: number
}

export interface CohortData {
  cohort: string
  churnRate: number
  userCount: number
}

export interface DashboardData {
  users: User[]
  stats: DashboardStats
  cohortData: CohortData[]
}
