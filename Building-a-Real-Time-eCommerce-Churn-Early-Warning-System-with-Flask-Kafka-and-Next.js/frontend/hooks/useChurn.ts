import { useState, useCallback } from 'react';

interface ChurnPredictionRequest {
  user_id: number;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ChurnPredictionResponse {
  churn_score: number;
}

interface UseChurnReturn {
  churnScore: number | null;
  isLoading: boolean;
  error: string | null;
  predictChurn: (userId: number, eventType: string, metadata?: Record<string, any>) => Promise<void>;
  clearError: () => void;
}

export const useChurn = (): UseChurnReturn => {
  const [churnScore, setChurnScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictChurn = useCallback(async (
    userId: number,
    eventType: string,
    metadata: Record<string, any> = {}
  ) => {
    setIsLoading(true);
    setError(null);
    setChurnScore(null);

    try {
      const requestData: ChurnPredictionRequest = {
        user_id: userId,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        metadata
      };

      const response = await fetch('/api/predict-churn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `HTTP error! status: ${response.status}`
        );
      }

      const data: ChurnPredictionResponse = await response.json();
      setChurnScore(data.churn_score);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Churn prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    churnScore,
    isLoading,
    error,
    predictChurn,
    clearError,
  };
};
