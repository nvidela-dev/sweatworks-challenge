import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlans } from '@/api';
import type { Plan } from '@/types';

interface UsePlansListResult {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlansList(activeOnly = true): UsePlansListResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPlans = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPlans({ isActive: activeOnly, pageSize: 100 });
      if (signal?.aborted) {
        return;
      }
      setPlans(result.data);
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activeOnly]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    fetchPlans(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchPlans]);

  const refetch = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    fetchPlans(abortControllerRef.current.signal);
  }, [fetchPlans]);

  return { plans, loading, error, refetch };
}
