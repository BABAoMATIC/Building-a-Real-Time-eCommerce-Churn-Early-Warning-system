import { NextResponse } from 'next/server'

// Dummy data for the dashboard
const dummyUsers = [
  { user_id: '1', name: 'John Smith', email: 'john@example.com', churn_score: 0.85, cohort: 'Jan 2024', risk_level: 'High' },
  { user_id: '2', name: 'Jane Doe', email: 'jane@example.com', churn_score: 0.45, cohort: 'Feb 2024', risk_level: 'Medium' },
  { user_id: '3', name: 'Mike Johnson', email: 'mike@example.com', churn_score: 0.72, cohort: 'Jan 2024', risk_level: 'High' },
  { user_id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', churn_score: 0.23, cohort: 'Mar 2024', risk_level: 'Low' },
  { user_id: '5', name: 'David Brown', email: 'david@example.com', churn_score: 0.91, cohort: 'Feb 2024', risk_level: 'High' },
  { user_id: '6', name: 'Lisa Davis', email: 'lisa@example.com', churn_score: 0.34, cohort: 'Mar 2024', risk_level: 'Low' },
  { user_id: '7', name: 'Tom Miller', email: 'tom@example.com', churn_score: 0.67, cohort: 'Jan 2024', risk_level: 'Medium' },
  { user_id: '8', name: 'Emma Garcia', email: 'emma@example.com', churn_score: 0.56, cohort: 'Feb 2024', risk_level: 'Medium' },
  { user_id: '9', name: 'Chris Martinez', email: 'chris@example.com', churn_score: 0.78, cohort: 'Mar 2024', risk_level: 'High' },
  { user_id: '10', name: 'Anna Rodriguez', email: 'anna@example.com', churn_score: 0.29, cohort: 'Jan 2024', risk_level: 'Low' },
]

const cohortData = [
  { cohort: 'Jan 2024', churnRate: 65.2, userCount: 1250 },
  { cohort: 'Feb 2024', churnRate: 58.7, userCount: 1180 },
  { cohort: 'Mar 2024', churnRate: 72.1, userCount: 1320 },
  { cohort: 'Apr 2024', churnRate: 45.3, userCount: 980 },
  { cohort: 'May 2024', churnRate: 38.9, userCount: 1150 },
  { cohort: 'Jun 2024', churnRate: 52.4, userCount: 1080 },
  { cohort: 'Jul 2024', churnRate: 67.8, userCount: 1420 },
  { cohort: 'Aug 2024', churnRate: 41.2, userCount: 1200 },
]

export async function GET() {
  try {
    // Calculate dashboard stats
    const totalUsers = dummyUsers.length
    const averageChurnRisk = Math.round(
      dummyUsers.reduce((sum, user) => sum + user.churn_score, 0) / totalUsers * 100
    )
    const highRiskUsers = dummyUsers.filter(user => user.churn_score >= 0.7).length
    const churnRateChange = -5.2 // Simulated change from last month

    const dashboardStats = {
      totalUsers,
      averageChurnRisk,
      highRiskUsers,
      churnRateChange,
    }

    const response = {
      users: dummyUsers,
      stats: dashboardStats,
      cohortData,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Error fetching user data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
