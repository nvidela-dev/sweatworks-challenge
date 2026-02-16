import type { Member } from '../db/schema/members.js';
import type { MemberQuery, CreateMemberInput } from '../schemas/member.schema.js';
import { type Paginated, paginate } from '../types/api.types.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { membersRepository, type MemberProfile } from './members.repository.js';

export const membersService = {
  async list(query: MemberQuery): Promise<Paginated<Member>> {
    const { data, total } = await membersRepository.findAll(query);
    return paginate(data, total, query.page, query.pageSize);
  },

  async getById(id: string): Promise<Member> {
    const member = await membersRepository.findById(id);
    if (!member) {
      throw new HttpError(ErrorCode.MEMBER_NOT_FOUND, 'Member not found', 404);
    }
    if (member.isDeleted) {
      throw new HttpError(ErrorCode.MEMBER_DELETED, 'Member has been deleted', 403);
    }
    return member;
  },

  async create(input: CreateMemberInput): Promise<Member> {
    const existing = await membersRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(ErrorCode.EMAIL_ALREADY_EXISTS, 'Email already exists', 409);
    }

    return membersRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
    });
  },

  async getProfile(id: string): Promise<MemberProfile> {
    const profile = await membersRepository.findProfileById(id);
    if (!profile) {
      throw new HttpError(ErrorCode.MEMBER_NOT_FOUND, 'Member not found', 404);
    }
    if (profile.member.isDeleted) {
      throw new HttpError(ErrorCode.MEMBER_DELETED, 'Member has been deleted', 403);
    }
    return profile;
  },
};
