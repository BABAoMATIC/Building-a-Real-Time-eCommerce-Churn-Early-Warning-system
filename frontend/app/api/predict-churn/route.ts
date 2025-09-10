import { NextRequest, NextResponse } from 'next/server';

interface ChurnPredictionRequest {
  user_id: number;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ChurnPredictionResponse {
  churn_score: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChurnPredictionRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.event_type || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, event_type, timestamp' },
        { status: 400 }
      );
    }

    // Get Flask API URL from environment or use default
    const flaskApiUrl = process.env.FLASK_API_URL || 'http://localhost:5000';
    
    try {
      // Try to forward request to Flask API
      const response = await fetch(`${flaskApiUrl}/predict-churn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Flask API returned ${response.status}`);
      }

      const data: ChurnPredictionResponse = await response.json();
      return NextResponse.json(data);
                } catch {
                  // If Flask API is not available, provide mock response
                  console.log('Flask API not available, using mock response');
      
      // Simple rule-based churn score calculation
      let churnScore = 0.2; // Default low risk
      
      if (body.event_type.toLowerCase() === 'bounce') {
        churnScore = 0.9; // High risk for bounce
      } else if (body.event_type.toLowerCase() === 'checkout') {
        churnScore = 0.1; // Low risk for checkout
      } else if (body.event_type.toLowerCase() === 'add_to_cart') {
        churnScore = 0.3; // Medium risk for add to cart
      }
      
      const mockData: ChurnPredictionResponse = {
        churn_score: churnScore
      };
      
      return NextResponse.json(mockData);
    }
  } catch (error: unknown) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
