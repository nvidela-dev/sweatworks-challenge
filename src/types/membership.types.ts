import type { Membership } from '../db/schema/index.js';
import type { ApiSuccessResponse } from './api.types.js';

export type MembershipResponse = Membership;

export type MembershipListResponse = ApiSuccessResponse<MembershipResponse[]>;
export type MembershipDetailResponse = ApiSuccessResponse<MembershipResponse>;
