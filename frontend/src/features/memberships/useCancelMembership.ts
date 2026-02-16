import { useState } from 'react';
import { ApiError, cancelMembership as cancelMembershipApi } from '@/api';
import type { CancelMembershipInput, Membership } from '@/types';

interface UseCancelMembershipResult {
  cancelMembership: (membershipId: string, input?: CancelMembershipInput) => Promise<Membership | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCancelMembership(): UseCancelMembershipResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setError(null);
  };

  const cancelMembership = async (
    membershipId: string,
    input: CancelMembershipInput = {}
  ): Promise<Membership | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelMembershipApi(membershipId, input);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to cancel membership');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cancelMembership, loading, error, reset };
}
