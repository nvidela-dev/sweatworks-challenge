import type { CheckIn } from '../db/schema/check-ins.js';
import type { CheckInQuery } from '../schemas/check-in.schema.js';
import { type Paginated, paginate } from '../types/api.types.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { checkInsRepository } from './check-ins.repository.js';
import { membersService } from '../members/index.js';
import { membershipsService } from '../memberships/index.js';

export const checkInsService = {
  async list(query: CheckInQuery): Promise<Paginated<CheckIn>> {
    const { data, total } = await checkInsRepository.findAll(query);
    return paginate(data, total, query.page, query.pageSize);
  },

  async getById(id: string): Promise<CheckIn> {
    const checkIn = await checkInsRepository.findById(id);
    if (!checkIn) {
      throw new HttpError(ErrorCode.CHECK_IN_NOT_FOUND, 'Check-in not found', 404);
    }
    return checkIn;
  },

  async create(memberId: string, checkedInAt?: string): Promise<CheckIn> {
    // Validates member exists and not deleted
    await membersService.getById(memberId);

    // Get active membership
    const activeMembership = await membershipsService.getActiveByMemberId(memberId);
    if (!activeMembership) {
      throw new HttpError(ErrorCode.NO_ACTIVE_MEMBERSHIP, 'Member has no active membership', 403);
    }

    return checkInsRepository.create({
      memberId,
      membershipId: activeMembership.id,
      checkedInAt: checkedInAt ? new Date(checkedInAt) : undefined,
    });
  },
};
