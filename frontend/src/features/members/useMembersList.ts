import { useCallback, useEffect, useRef, useState } from 'react';
import { getMembers } from '@/api';
import type { Member, MembersListParams, PaginationMeta } from '@/types';

interface UseMembersListResult {
  members: Member[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMembersList(params: MembersListParams): UseMembersListResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { page, pageSize, search } = params;

  const fetchMembers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMembers({ page, pageSize, search });
      if (signal?.aborted) {
        return;
      }
      setMembers(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    fetchMembers(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchMembers]);

  const refetch = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    fetchMembers(abortControllerRef.current.signal);
  }, [fetchMembers]);

  return { members, meta, loading, error, refetch };
}
