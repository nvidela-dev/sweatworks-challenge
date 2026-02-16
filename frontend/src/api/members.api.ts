import type {
  Member,
  MemberProfile,
  CreateMemberInput,
  MembersListParams,
  PaginationMeta,
} from '@/types';
import { get, post, getPaginated } from './client';

export async function getMembers(
  params: MembersListParams = {}
): Promise<{ data: Member[]; meta: PaginationMeta }> {
  return getPaginated<Member>('/members', params);
}

export async function getMemberProfile(id: string): Promise<MemberProfile> {
  return get<MemberProfile>(`/members/${id}`);
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
  return post<Member>('/members', input);
}
