export type MembershipStatus = 'active' | 'cancelled' | 'expired';

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  cancelledAt: string | null;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipInput {
  memberId: string;
  planId: string;
  startDate: string;
  endDate?: string;
}

export interface CancelMembershipInput {
  cancelledAt?: string;
}

export interface MembershipsListParams {
  page?: number;
  pageSize?: number;
  memberId?: string;
  planId?: string;
  status?: MembershipStatus;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
