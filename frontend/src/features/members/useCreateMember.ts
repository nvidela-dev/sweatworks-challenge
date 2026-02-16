import { useState } from 'react';
import { ApiError, createMember as createMemberApi } from '@/api';
import type { CreateMemberInput, Member } from '@/types';

interface UseCreateMemberResult {
  createMember: (input: CreateMemberInput) => Promise<Member | null>;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  reset: () => void;
}

export function useCreateMember(): UseCreateMemberResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setError(null);
    setFieldErrors({});
  };

  const createMember = async (input: CreateMemberInput): Promise<Member | null> => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = await createMemberApi(input);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          const errors: Record<string, string> = {};
          for (const detail of err.details) {
            errors[detail.field] = detail.message;
          }
          setFieldErrors(errors);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create member');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createMember, loading, error, fieldErrors, reset };
}
