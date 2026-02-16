import { useState } from 'react';
import { ApiError, createCheckIn as createCheckInApi } from '@/api';
import type { CheckIn } from '@/types';

interface UseCheckInResult {
  checkIn: (memberId: string) => Promise<CheckIn | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCheckIn(): UseCheckInResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
  };

  const checkIn = async (memberId: string): Promise<CheckIn | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createCheckInApi(memberId);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to record check-in');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { checkIn, loading, error, reset };
}
