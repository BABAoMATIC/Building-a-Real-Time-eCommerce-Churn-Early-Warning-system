import { useState, useEffect } from 'react'

/**
 * Custom hook to ensure components only render on the client side
 * This prevents hydration mismatches in Next.js
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
