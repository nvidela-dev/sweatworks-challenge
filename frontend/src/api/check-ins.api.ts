import { get, post, getPaginated } from './client';
import type { CheckIn, CreateCheckInInput, CheckInsListParams, PaginationMeta } from '@/types';

export async function getCheckIns(
  params: CheckInsListParams = {}
): Promise<{ data: CheckIn[]; meta: PaginationMeta }> {
  return getPaginated<CheckIn>('/check-ins', params);
}

export async function getCheckIn(id: string): Promise<CheckIn> {
  return get<CheckIn>(`/check-ins/${id}`);
}

export async function createCheckIn(
  memberId: string,
  input: CreateCheckInInput = {}
): Promise<CheckIn> {
  return post<CheckIn>(`/members/${memberId}/check-ins`, input);
}
