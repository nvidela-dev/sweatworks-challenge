import type { CheckIn } from '../db/schema/index.js';
import type { ApiSuccessResponse } from './api.types.js';

export type CheckInResponse = CheckIn;

export type CheckInListResponse = ApiSuccessResponse<CheckInResponse[]>;
export type CheckInDetailResponse = ApiSuccessResponse<CheckInResponse>;
