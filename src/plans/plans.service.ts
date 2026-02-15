import type { Plan } from '../db/schema/plans.js';
import type { PlanQuery } from '../schemas/plan.schema.js';
import type { PaginationMeta } from '../types/api.types.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { plansRepository } from './plans.repository.js';

interface PaginatedPlans {
  data: Plan[];
  meta: PaginationMeta;
}

export const plansService = {
  async list(query: PlanQuery): Promise<PaginatedPlans> {
    const { data, total } = await plansRepository.findAll(query);
    const totalPages = Math.ceil(total / query.pageSize);

    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalCount: total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };
  },

  async getById(id: string): Promise<Plan> {
    const plan = await plansRepository.findById(id);
    if (!plan) {
      throw new HttpError(ErrorCode.PLAN_NOT_FOUND, 'Plan not found', 404);
    }
    return plan;
  },
};
