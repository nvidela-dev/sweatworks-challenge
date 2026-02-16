import { useCallback, useEffect, useRef, useState } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    if (!memberId) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMemberProfile(memberId);
      if (signal?.aborted) {
        return;
      }
      setProfile(result);
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch member profile');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [memberId]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    fetchProfile(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    fetchProfile(abortControllerRef.current.signal);
  }, [fetchProfile]);

  return { profile, loading, error, refetch };
}
