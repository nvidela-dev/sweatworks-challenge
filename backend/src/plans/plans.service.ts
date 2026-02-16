import type { Plan } from '../db/schema/plans.js';
import type { PlanQuery } from '../schemas/plan.schema.js';
import { type Paginated, paginate } from '../types/api.types.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { plansRepository } from './plans.repository.js';

export const plansService = {
  async list(query: PlanQuery): Promise<Paginated<Plan>> {
    const { data, total } = await plansRepository.findAll(query);
    return paginate(data, total, query.page, query.pageSize);
  },

  async getById(id: string): Promise<Plan> {
    const plan = await plansRepository.findById(id);
    if (!plan) {
      throw new HttpError(ErrorCode.PLAN_NOT_FOUND, 'Plan not found', 404);
    }
    return plan;
  },
};
