import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Types for individual churn prediction
interface ChurnPredictionRequest {
  user_id: number;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ChurnPredictionResponse {
  churn_score: number;
}

// Types for user data from Flask API
interface User {
  user_id: string;
  churn_score: number;
  cohort: string;
  name?: string;
  email?: string;
  risk_level?: string;
}

interface UseChurnReturn {
  // Individual prediction (existing functionality)
  churnScore: number | null;
  isLoading: boolean;
  error: string | null;
  predictChurn: (userId: number, eventType: string, metadata?: Record<string, any>) => Promise<void>;
  clearError: () => void;
  
  // Bulk user data (new functionality)
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  fetchUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useChurn = (): UseChurnReturn => {
  // Individual prediction states
  const [churnScore, setChurnScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk user data states
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Individual prediction function (existing)
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

  // Fetch users from Flask API
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const response = await axios.get('/api/users', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setUsersError(errorMessage);
      
      // Show toast notification on error
      toast.error(`Failed to fetch churn data: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Refresh users (alias for fetchUsers)
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Clear individual prediction error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    // Individual prediction
    churnScore,
    isLoading,
    error,
    predictChurn,
    clearError,
    
    // Bulk user data
    users,
    usersLoading,
    usersError,
    fetchUsers,
    refreshUsers,
  };
};
