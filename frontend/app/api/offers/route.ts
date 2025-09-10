import { NextResponse } from 'next/server'

// Dummy data for offer rules
const offerRules = [
  {
    id: '1',
    condition: 'churn_risk > 0.7',
    action: 'Send 15% discount coupon',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    condition: 'churn_risk > 0.5',
    action: 'Send personalized email with product recommendations',
    isActive: true,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    condition: 'days_since_last_order > 30',
    action: 'Send free shipping offer',
    isActive: false,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    condition: 'support_tickets > 2',
    action: 'Assign dedicated customer success manager',
    isActive: true,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    condition: 'payment_failures > 1',
    action: 'Send payment method update reminder',
    isActive: true,
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z'
  }
]

export async function GET() {
  try {
    const response = {
      rules: offerRules,
      total: offerRules.length
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('Error fetching offer rules:', err)
    return NextResponse.json(
      { error: 'Failed to fetch offer rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { condition, action } = body

    if (!condition || !action) {
      return NextResponse.json(
        { error: 'Condition and action are required' },
        { status: 400 }
      )
    }

    const newRule = {
      id: (offerRules.length + 1).toString(),
      condition,
      action,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    offerRules.push(newRule)

    return NextResponse.json(newRule, { status: 201 })
  } catch (err) {
    console.error('Error creating offer rule:', err)
    return NextResponse.json(
      { error: 'Failed to create offer rule' },
      { status: 500 }
    )
  }
}
