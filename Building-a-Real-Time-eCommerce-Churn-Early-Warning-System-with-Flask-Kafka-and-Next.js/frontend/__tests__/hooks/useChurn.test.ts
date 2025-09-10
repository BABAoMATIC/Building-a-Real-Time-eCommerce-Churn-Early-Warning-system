import { renderHook, act, waitFor } from '@testing-library/react';
import { useChurn } from '@/hooks/useChurn';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useChurn Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useChurn());

      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.predictChurn).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Successful API Request', () => {
    it('should fetch churn score and update state correctly', async () => {
      const mockResponse = {
        churn_score: 0.75
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(123, 'bounce', { page: '/checkout' });
      });

      expect(result.current.churnScore).toBe(0.75);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith('/api/predict-churn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 123,
          event_type: 'bounce',
          timestamp: expect.any(String),
          metadata: { page: '/checkout' }
        }),
      });
    });

    it('should handle different churn scores correctly', async () => {
      const testCases = [
        { score: 0.2, expected: 0.2 },
        { score: 0.5, expected: 0.5 },
        { score: 0.9, expected: 0.9 },
        { score: 0.0, expected: 0.0 },
        { score: 1.0, expected: 1.0 }
      ];

      for (const testCase of testCases) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ churn_score: testCase.score }),
        });

        const { result } = renderHook(() => useChurn());

        await act(async () => {
          await result.current.predictChurn(1, 'test');
        });

        expect(result.current.churnScore).toBe(testCase.expected);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();

        jest.clearAllMocks();
      }
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during API request', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() => useChurn());

      // Start the request
      act(() => {
        result.current.predictChurn(123, 'bounce');
      });

      // Check loading state is true
      expect(result.current.isLoading).toBe(true);
      expect(result.current.churnScore).toBeNull();
      expect(result.current.error).toBeNull();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ churn_score: 0.5 }),
        });
        await promise;
      });

      // Check loading state is false after completion
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous churn score when starting new request', async () => {
      // First request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.8 }),
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'bounce');
      });

      expect(result.current.churnScore).toBe(0.8);

      // Second request - should clear previous score
      let resolveSecondPromise: (value: any) => void;
      const secondPromise = new Promise((resolve) => {
        resolveSecondPromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(secondPromise);

      act(() => {
        result.current.predictChurn(2, 'login');
      });

      // Should clear previous score and set loading
      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(true);

      // Resolve second request
      await act(async () => {
        resolveSecondPromise!({
          ok: true,
          json: async () => ({ churn_score: 0.3 }),
        });
        await secondPromise;
      });

      expect(result.current.churnScore).toBe(0.3);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        error: 'Invalid user ID provided'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(999, 'invalid');
      });

      expect(result.current.error).toBe('Invalid user ID provided');
      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle HTTP error without JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(result.current.error).toBe('HTTP error! status: 500');
      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith('Churn prediction error:', expect.any(Error));
    });

    it('should handle unexpected errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Unexpected error');

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(result.current.error).toBe('An unexpected error occurred');
      expect(result.current.churnScore).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error when starting new request', async () => {
      // First request fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(result.current.error).toBe('First error');

      // Second request - should clear error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      await act(async () => {
        await result.current.predictChurn(2, 'test');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.churnScore).toBe(0.5);
    });
  });

  describe('clearError Function', () => {
    it('should clear error state', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Request Parameters', () => {
    it('should send correct request data with all parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      const { result } = renderHook(() => useChurn());

      const userId = 456;
      const eventType = 'add_to_cart';
      const metadata = { 
        product_id: 'PROD-123', 
        quantity: 2, 
        price: 29.99 
      };

      await act(async () => {
        await result.current.predictChurn(userId, eventType, metadata);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/predict-churn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          event_type: eventType,
          timestamp: expect.any(String),
          metadata: metadata
        }),
      });
    });

    it('should handle empty metadata object', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test', {});
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/predict-churn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          event_type: 'test',
          timestamp: expect.any(String),
          metadata: {}
        }),
      });
    });

    it('should handle undefined metadata', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/predict-churn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          event_type: 'test',
          timestamp: expect.any(String),
          metadata: {}
        }),
      });
    });
  });

  describe('Timestamp Generation', () => {
    it('should generate valid ISO timestamp', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      const { result } = renderHook(() => useChurn());

      await act(async () => {
        await result.current.predictChurn(1, 'test');
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      // Verify timestamp is a valid ISO string
      expect(requestBody.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Verify timestamp is recent (within last 5 seconds)
      const timestamp = new Date(requestBody.timestamp);
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      expect(diff).toBeLessThan(5000);
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should handle multiple rapid requests correctly', async () => {
      const responses = [
        { churn_score: 0.2 },
        { churn_score: 0.8 },
        { churn_score: 0.5 }
      ];

      responses.forEach(response => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });
      });

      const { result } = renderHook(() => useChurn());

      // Make multiple rapid requests
      await act(async () => {
        const promises = [
          result.current.predictChurn(1, 'bounce'),
          result.current.predictChurn(2, 'login'),
          result.current.predictChurn(3, 'purchase')
        ];
        await Promise.all(promises);
      });

      // Should have the result from the last request
      expect(result.current.churnScore).toBe(0.5);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
