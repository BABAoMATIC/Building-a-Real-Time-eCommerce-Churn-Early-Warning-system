import { NextRequest, NextResponse } from 'next/server';

interface ChurnPredictionRequest {
  user_id: number;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, any>;
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
    
    // Forward request to Flask API
    const response = await fetch(`${flaskApiUrl}/predict-churn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Flask API error' },
        { status: response.status }
      );
    }

    const data: ChurnPredictionResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
