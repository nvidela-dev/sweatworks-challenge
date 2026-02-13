import type { Member } from '../db/schema/index.js';
import type { ApiSuccessResponse } from './api.types.js';

export interface MemberResponse extends Member {
  fullName: string;
}

export type MemberListResponse = ApiSuccessResponse<MemberResponse[]>;
export type MemberDetailResponse = ApiSuccessResponse<MemberResponse>;
