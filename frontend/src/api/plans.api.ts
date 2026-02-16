import { get, getPaginated } from './client';
import type { Plan, PlansListParams, PaginationMeta } from '@/types';

export async function getPlans(
  params: PlansListParams = {}
): Promise<{ data: Plan[]; meta: PaginationMeta }> {
  return getPaginated<Plan>('/plans', params);
}

export async function getPlan(id: string): Promise<Plan> {
  return get<Plan>(`/plans/${id}`);
}
