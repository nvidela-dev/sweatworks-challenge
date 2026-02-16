import { get, post, patch, getPaginated } from './client';
import type {
  Membership,
  CreateMembershipInput,
  CancelMembershipInput,
  MembershipsListParams,
  PaginationMeta,
} from '@/types';

export async function getMemberships(
  params: MembershipsListParams = {}
): Promise<{ data: Membership[]; meta: PaginationMeta }> {
  return getPaginated<Membership>('/memberships', params);
}

export async function getMembership(id: string): Promise<Membership> {
  return get<Membership>(`/memberships/${id}`);
}

export async function createMembership(input: CreateMembershipInput): Promise<Membership> {
  return post<Membership>('/memberships', input);
}

export async function cancelMembership(
  id: string,
  input: CancelMembershipInput = {}
): Promise<Membership> {
  return patch<Membership>(`/memberships/${id}/cancel`, input);
}
