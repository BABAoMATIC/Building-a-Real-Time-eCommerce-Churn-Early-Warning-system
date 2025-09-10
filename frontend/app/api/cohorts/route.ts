import { NextResponse } from 'next/server';

// Mock cohort data - in production, this would come from your database
const generateMockCohortData = () => {
  // Simulate different churn risk levels
  const cohorts = [
    { risk_level: 'Low', count: 1250, percentage: 45.2 },
    { risk_level: 'Medium', count: 890, percentage: 32.1 },
    { risk_level: 'High', count: 625, percentage: 22.7 }
  ];

  // Add some additional metadata
  const totalUsers = cohorts.reduce((sum, cohort) => sum + cohort.count, 0);
  
  return {
    cohorts,
    total_users: totalUsers,
    last_updated: new Date().toISOString(),
    summary: {
      low_risk_users: cohorts[0].count,
      medium_risk_users: cohorts[1].count,
      high_risk_users: cohorts[2].count,
      average_churn_risk: 0.35 // Mock average
    }
  };
};

export async function GET() {
  try {
    // In production, you would fetch this data from your database
    // For now, we'll use mock data
    const cohortData = generateMockCohortData();

    return NextResponse.json({
      success: true,
      data: cohortData
    });

  } catch (error: unknown) {
    console.error('Error fetching cohort data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cohort data',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to refresh cohort data
export async function POST() {
  try {
    // In production, this might trigger a recalculation of cohorts
    // For now, just return fresh mock data
    const cohortData = generateMockCohortData();

    return NextResponse.json({
      success: true,
      message: 'Cohort data refreshed',
      data: cohortData
    });

  } catch (error: unknown) {
    console.error('Error refreshing cohort data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh cohort data',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
