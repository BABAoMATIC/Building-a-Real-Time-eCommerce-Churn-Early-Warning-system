import { useState, useEffect, useCallback } from 'react';

export interface CohortData {
  risk_level: string;
  count: number;
  percentage: number;
}

export interface CohortsResponse {
  cohorts: CohortData[];
  total_users: number;
  last_updated: string;
  summary: {
    low_risk_users: number;
    medium_risk_users: number;
    high_risk_users: number;
    average_churn_risk: number;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: CohortsResponse;
  error?: string;
  details?: string;
}

export const useCohorts = () => {
  const [cohortsData, setCohortsData] = useState<CohortsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCohorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cohorts', {
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
        setCohortsData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch cohort data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while fetching cohort data';
      setError(errorMessage);
      console.error('Error fetching cohorts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCohorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cohorts', {
        method: 'POST',
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
        setCohortsData(result.data);
      } else {
        throw new Error(result.error || 'Failed to refresh cohort data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred while refreshing cohort data';
      setError(errorMessage);
      console.error('Error refreshing cohorts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  return {
    cohortsData,
    isLoading,
    error,
    fetchCohorts,
    refreshCohorts,
  };
};
