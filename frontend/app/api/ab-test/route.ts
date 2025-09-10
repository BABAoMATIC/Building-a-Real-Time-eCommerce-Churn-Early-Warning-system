import { NextResponse } from 'next/server';

// Mock A/B test data - in production, this would come from your database
interface ABTestCondition {
  id: string;
  name: string;
  type: 'control' | 'treatment';
  offer_rule: {
    condition: string;
    action: string;
    description: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ABTestData {
  current_condition: 'control' | 'treatment';
  conditions: {
    control: ABTestCondition;
    treatment: ABTestCondition;
  };
  test_metadata: {
    test_name: string;
    start_date: string;
    expected_duration: string;
    success_metrics: string[];
  };
}

const generateMockABTestData = (): ABTestData => {
  return {
    current_condition: 'control',
    conditions: {
      control: {
        id: 'control-001',
        name: 'Control Group',
        type: 'control',
        offer_rule: {
          condition: 'churn_score >= 0.7',
          action: 'send_email_reminder',
          description: 'Send standard email reminder to high-risk users'
        },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      },
      treatment: {
        id: 'treatment-001',
        name: 'Treatment Group',
        type: 'treatment',
        offer_rule: {
          condition: 'churn_score >= 0.7',
          action: 'send_personalized_offer',
          description: 'Send personalized discount offer to high-risk users'
        },
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      }
    },
    test_metadata: {
      test_name: 'Churn Prevention Offer Test',
      start_date: '2024-01-01T00:00:00Z',
      expected_duration: '30 days',
      success_metrics: ['churn_rate', 'engagement_rate', 'conversion_rate']
    }
  };
};

// Store current state (in production, this would be in a database)
let currentABTestData = generateMockABTestData();

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: currentABTestData
    });

  } catch (error: unknown) {
    console.error('Error fetching A/B test data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch A/B test data',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { condition } = body;

    if (!condition || !['control', 'treatment'].includes(condition)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid condition. Must be "control" or "treatment"' 
        },
        { status: 400 }
      );
    }

    // Update the current condition
    currentABTestData.current_condition = condition;
    
    // Update the active status of conditions
    currentABTestData.conditions.control.is_active = condition === 'control';
    currentABTestData.conditions.treatment.is_active = condition === 'treatment';
    
    // Update timestamps
    const now = new Date().toISOString();
    currentABTestData.conditions.control.updated_at = now;
    currentABTestData.conditions.treatment.updated_at = now;

    // In production, you would save this to your database
    console.log(`A/B test condition changed to: ${condition}`);

    return NextResponse.json({
      success: true,
      message: `A/B test condition updated to ${condition}`,
      data: currentABTestData
    });

  } catch (error: unknown) {
    console.error('Error updating A/B test condition:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update A/B test condition',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: PUT endpoint to reset the test
export async function PUT() {
  try {
    // Reset to default state
    currentABTestData = generateMockABTestData();

    return NextResponse.json({
      success: true,
      message: 'A/B test reset to default state',
      data: currentABTestData
    });

  } catch (error: unknown) {
    console.error('Error resetting A/B test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset A/B test',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
