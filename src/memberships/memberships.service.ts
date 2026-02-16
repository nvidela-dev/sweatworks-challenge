import type { Membership } from '../db/schema/memberships.js';
import type { Plan } from '../db/schema/plans.js';
import type { MembershipQuery, CreateMembershipInput, CancelMembershipInput } from '../schemas/membership.schema.js';
import type { PaginationMeta } from '../types/api.types.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { membershipsRepository } from './memberships.repository.js';
import { membersService } from '../members/index.js';
import { plansService } from '../plans/index.js';

interface PaginatedMemberships {
  data: Membership[];
  meta: PaginationMeta;
}

function formatDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculateEndDate(startDate: string, plan: Plan): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + plan.durationDays);
  return formatDateString(start);
}

export const membershipsService = {
  async list(query: MembershipQuery): Promise<PaginatedMemberships> {
    const { data, total } = await membershipsRepository.findAll(query);
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

  async getById(id: string): Promise<Membership> {
    const membership = await membershipsRepository.findById(id);
    if (!membership) {
      throw new HttpError(ErrorCode.MEMBERSHIP_NOT_FOUND, 'Membership not found', 404);
    }
    return membership;
  },

  async create(input: CreateMembershipInput): Promise<Membership> {
    // Validates existence and soft-delete status
    await membersService.getById(input.memberId);

    // Validates existence
    const plan = await plansService.getById(input.planId);
    if (!plan.isActive) {
      throw new HttpError(ErrorCode.PLAN_INACTIVE, 'Plan is not active', 422);
    }

    const activeMembership = await membershipsRepository.findActiveByMemberId(input.memberId);
    if (activeMembership) {
      throw new HttpError(ErrorCode.ACTIVE_MEMBERSHIP_EXISTS, 'Member already has an active membership', 409);
    }

    const endDate = input.endDate ?? calculateEndDate(input.startDate, plan);

    return membershipsRepository.create({
      memberId: input.memberId,
      planId: input.planId,
      startDate: input.startDate,
      endDate,
      status: 'active',
    });
  },

  async cancel(id: string, input: CancelMembershipInput): Promise<Membership> {
    const membership = await membershipsRepository.findById(id);
    if (!membership) {
      throw new HttpError(ErrorCode.MEMBERSHIP_NOT_FOUND, 'Membership not found', 404);
    }
    if (membership.status !== 'active') {
      const code = membership.status === 'cancelled'
        ? ErrorCode.MEMBERSHIP_ALREADY_CANCELLED
        : ErrorCode.MEMBERSHIP_EXPIRED;
      throw new HttpError(code, `Membership is ${membership.status}`, 409);
    }

    const cancelledAt = input.cancelledAt ?? formatDateString(new Date());

    return membershipsRepository.cancel(id, cancelledAt);
  },
};
