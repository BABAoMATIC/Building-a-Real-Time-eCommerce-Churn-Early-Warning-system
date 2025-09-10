'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const testRegistration = async () => {
    setLoading(true)
    try {
      const response = await register(
        'debug@example.com',
        'password123',
        'Debug User',
        'Debug Company'
      )
      setResult(response)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testDirectAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'direct@example.com',
          password: 'password123',
          name: 'Direct User',
          company: 'Direct Company'
        })
      })
      
      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data
      })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Registration</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testRegistration}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth Context Registration'}
          </button>
          
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Direct API Call'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
