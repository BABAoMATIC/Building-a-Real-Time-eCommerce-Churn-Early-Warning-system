import { useState, useEffect, useCallback } from 'react';

export interface OfferRule {
  condition: string;
  action: string;
  description: string;
}

export interface ABTestCondition {
  id: string;
  name: string;
  type: 'control' | 'treatment';
  offer_rule: OfferRule;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABTestData {
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

export interface ApiResponse {
  success: boolean;
  data?: ABTestData;
  message?: string;
  error?: string;
  details?: string;
}

export const useABTest = () => {
  const [abTestData, setABTestData] = useState<ABTestData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchABTestData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ab-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setABTestData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch A/B test data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while fetching A/B test data';
      setError(errorMessage);
      console.error('Error fetching A/B test data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateABTestCondition = useCallback(async (condition: 'control' | 'treatment') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ab-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ condition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setABTestData(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update A/B test condition');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while updating A/B test condition';
      setError(errorMessage);
      console.error('Error updating A/B test condition:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetABTest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ab-test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setABTestData(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to reset A/B test');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while resetting A/B test';
      setError(errorMessage);
      console.error('Error resetting A/B test:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchABTestData();
  }, [fetchABTestData]);

  return {
    abTestData,
    isLoading,
    error,
    fetchABTestData,
    updateABTestCondition,
    resetABTest,
  };
};
