import { useCallback, useEffect, useState } from 'react';
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

  const { page, pageSize, search } = params;

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMembers({ page, pageSize, search });
      setMembers(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, meta, loading, error, refetch: fetchMembers };
}
