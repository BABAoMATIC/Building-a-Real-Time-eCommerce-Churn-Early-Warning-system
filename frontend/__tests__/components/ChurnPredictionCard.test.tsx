import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChurnPredictionCard } from '@/components/ui/ChurnPredictionCard';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ChurnPredictionCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Initial Render', () => {
    it('should render with default props', () => {
      render(<ChurnPredictionCard />);

      expect(screen.getByText('Churn Prediction')).toBeInTheDocument();
      expect(screen.getByText('Predict Churn')).toBeInTheDocument();
      expect(screen.getByText('User ID: 1')).toBeInTheDocument();
      expect(screen.getByText('Event Type: page_view')).toBeInTheDocument();
      expect(screen.getByText('Click "Predict Churn" to analyze user behavior')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      render(
        <ChurnPredictionCard
          userId={123}
          eventType="bounce"
          metadata={{ page: '/checkout' }}
        />
      );

      expect(screen.getByText('User ID: 123')).toBeInTheDocument();
      expect(screen.getByText('Event Type: bounce')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loader while waiting for data', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(promise);

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      // Should show loading state
      expect(screen.getByText('Predicting...')).toBeInTheDocument();
      expect(screen.getByText('Analyzing user behavior...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Predicting...' })).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ churn_score: 0.5 }),
        });
        await promise;
      });

      await waitFor(() => {
        expect(screen.queryByText('Predicting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Prediction', () => {
    it('should display churn score correctly for low risk', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.2 }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('20.0%')).toBeInTheDocument();
        expect(screen.getByText('Low Risk')).toBeInTheDocument();
        expect(screen.getByText('Score: 0.200')).toBeInTheDocument();
        expect(screen.getByText('✅ Low risk: User appears engaged')).toBeInTheDocument();
      });
    });

    it('should display churn score correctly for medium risk', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument();
        expect(screen.getByText('Medium Risk')).toBeInTheDocument();
        expect(screen.getByText('Score: 0.500')).toBeInTheDocument();
        expect(screen.getByText('🟡 Medium risk: Monitor closely')).toBeInTheDocument();
      });
    });

    it('should display churn score correctly for high risk', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.7 }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('70.0%')).toBeInTheDocument();
        expect(screen.getByText('High Risk')).toBeInTheDocument();
        expect(screen.getByText('Score: 0.700')).toBeInTheDocument();
        expect(screen.getByText('🔶 High risk: Proactive engagement needed')).toBeInTheDocument();
      });
    });

    it('should display churn score correctly for critical risk', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.9 }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('90.0%')).toBeInTheDocument();
        expect(screen.getByText('Critical Risk')).toBeInTheDocument();
        expect(screen.getByText('Score: 0.900')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Critical risk: Immediate intervention recommended')).toBeInTheDocument();
      });
    });

    it('should display progress bar with correct width', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.75 }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar', { hidden: true });
        expect(progressBar).toHaveStyle('width: 75%');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message if API request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid user ID provided' }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('Prediction Failed')).toBeInTheDocument();
        expect(screen.getByText('Invalid user ID provided')).toBeInTheDocument();
        expect(screen.getByText('Dismiss')).toBeInTheDocument();
      });
    });

    it('should display error message for network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('Prediction Failed')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should allow dismissing error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('Prediction Failed')).toBeInTheDocument();
      });

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Prediction Failed')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Request Parameters', () => {
    it('should send correct request data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ churn_score: 0.5 }),
      });

      render(
        <ChurnPredictionCard
          userId={456}
          eventType="add_to_cart"
          metadata={{ product_id: 'PROD-123', quantity: 2 }}
        />
      );

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/predict-churn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 456,
            event_type: 'add_to_cart',
            timestamp: expect.any(String),
            metadata: { product_id: 'PROD-123', quantity: 2 }
          }),
        });
      });
    });
  });

  describe('Risk Level Styling', () => {
    it('should apply correct styling for different risk levels', async () => {
      const testCases = [
        { score: 0.2, expectedClass: 'bg-green-50' },
        { score: 0.5, expectedClass: 'bg-yellow-50' },
        { score: 0.7, expectedClass: 'bg-orange-50' },
        { score: 0.9, expectedClass: 'bg-red-50' }
      ];

      for (const testCase of testCases) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ churn_score: testCase.score }),
        });

        const { container } = render(<ChurnPredictionCard />);

        const predictButton = screen.getByText('Predict Churn');
        fireEvent.click(predictButton);

        await waitFor(() => {
          const riskCard = container.querySelector(`.${testCase.expectedClass}`);
          expect(riskCard).toBeInTheDocument();
        });

        jest.clearAllMocks();
      }
    });
  });

  describe('Button States', () => {
    it('should disable button during loading', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(promise);

      render(<ChurnPredictionCard />);

      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      // Button should be disabled during loading
      expect(screen.getByRole('button', { name: 'Predicting...' })).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ churn_score: 0.5 }),
        });
        await promise;
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Predict Churn' })).not.toBeDisabled();
      });
    });
  });

  describe('Multiple Predictions', () => {
    it('should handle multiple prediction requests', async () => {
      const responses = [
        { churn_score: 0.3 },
        { churn_score: 0.8 }
      ];

      responses.forEach(response => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });
      });

      render(<ChurnPredictionCard />);

      // First prediction
      const predictButton = screen.getByText('Predict Churn');
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('30.0%')).toBeInTheDocument();
        expect(screen.getByText('Low Risk')).toBeInTheDocument();
      });

      // Second prediction
      fireEvent.click(predictButton);

      await waitFor(() => {
        expect(screen.getByText('80.0%')).toBeInTheDocument();
        expect(screen.getByText('Critical Risk')).toBeInTheDocument();
      });
    });
  });
});
