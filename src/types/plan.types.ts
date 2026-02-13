import type { Plan } from '../db/schema/index.js';
import type { ApiSuccessResponse } from './api.types.js';

export type PlanResponse = Plan;

export type PlanListResponse = ApiSuccessResponse<PlanResponse[]>;
export type PlanDetailResponse = ApiSuccessResponse<PlanResponse>;
