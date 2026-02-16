import type { Membership } from './membership.types';
import type { Plan } from './plan.types';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipWithPlan extends Membership {
  plan: Plan;
}

export interface MemberProfile {
  member: Member;
  activeMembership: MembershipWithPlan | null;
  lastCheckIn: string | null;
  checkInsLast30Days: number;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface MembersListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}
