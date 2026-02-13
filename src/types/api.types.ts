import type { Member, Plan, Membership, CheckIn } from '../db/schema/index.js';
import type { ApiError } from './error.types.js';

// ============================================
// Pagination Meta
// ============================================

export interface CursorPaginationMeta {
  type: 'cursor';
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface OffsetPaginationMeta {
  type: 'offset';
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PaginationMeta = CursorPaginationMeta | OffsetPaginationMeta;

// ============================================
// API Response Wrappers (Discriminated Union)
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Entity Response Types
// ============================================

export interface MemberResponse extends Member {
  fullName: string;
  activeMembership?: MembershipResponse | null;
}

export type PlanResponse = Plan;

export interface MembershipResponse extends Membership {
  member?: MemberResponse;
  plan?: PlanResponse;
}

export interface CheckInResponse extends CheckIn {
  member?: MemberResponse;
  membership?: MembershipResponse;
}

// ============================================
// List Response Types
// ============================================

export type MemberListResponse = ApiSuccessResponse<MemberResponse[]>;
export type PlanListResponse = ApiSuccessResponse<PlanResponse[]>;
export type MembershipListResponse = ApiSuccessResponse<MembershipResponse[]>;
export type CheckInListResponse = ApiSuccessResponse<CheckInResponse[]>;

// ============================================
// Single Entity Response Types
// ============================================

export type MemberDetailResponse = ApiSuccessResponse<MemberResponse>;
export type PlanDetailResponse = ApiSuccessResponse<PlanResponse>;
export type MembershipDetailResponse = ApiSuccessResponse<MembershipResponse>;
export type CheckInDetailResponse = ApiSuccessResponse<CheckInResponse>;
