import { useState } from 'react';
import { ApiError, createMembership as createMembershipApi } from '@/api';
import type { CreateMembershipInput, Membership } from '@/types';

interface UseAssignMembershipResult {
  assignMembership: (input: CreateMembershipInput) => Promise<Membership | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAssignMembership(): UseAssignMembershipResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
  };

  const assignMembership = async (input: CreateMembershipInput): Promise<Membership | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createMembershipApi(input);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to assign membership');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { assignMembership, loading, error, reset };
}
