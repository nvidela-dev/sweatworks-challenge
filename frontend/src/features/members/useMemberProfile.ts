import { useCallback, useEffect, useState } from 'react';
import { getMemberProfile } from '@/api';
import type { MemberProfile } from '@/types';

interface UseMemberProfileResult {
  profile: MemberProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMemberProfile(memberId: string): UseMemberProfileResult {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!memberId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMemberProfile(memberId);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member profile');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
