import { and, eq, ilike, or, asc, desc, sql, gte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { members, type Member, type NewMember } from '../db/schema/members.js';
import { memberships } from '../db/schema/memberships.js';
import { plans, type Plan } from '../db/schema/plans.js';
import { checkIns } from '../db/schema/check-ins.js';
import type { MemberQuery } from '../schemas/member.schema.js';
import { buildConditions } from '../utils/index.js';

export interface MembershipWithPlan {
  id: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: string;
  plan: Plan;
}

export interface MemberProfile {
  member: Member;
  activeMembership: MembershipWithPlan | null;
  lastCheckIn: Date | null;
  checkInsLast30Days: number;
}

export const membersRepository = {
  async findAll(query: MemberQuery): Promise<{ data: Member[]; total: number }> {
    const { page, pageSize, search, sortBy, sortOrder, includeDeleted } = query;
    const offset = (page - 1) * pageSize;

    const conditions = buildConditions([
      [!includeDeleted, () => eq(members.isDeleted, false)],
      [search, () => or(
        ilike(members.firstName, `%${search}%`),
        ilike(members.lastName, `%${search}%`),
        ilike(members.email, `%${search}%`)
      )],
    ]);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderDirection = sortOrder === 'asc' ? asc : desc;
    const orderColumn = members[sortBy];

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(members)
        .where(whereClause)
        .orderBy(orderDirection(orderColumn))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(members)
        .where(whereClause),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  },

  async findByEmail(email: string): Promise<Member | undefined> {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.email, email.toLowerCase()))
      .limit(1);
    return result[0];
  },

  async create(data: NewMember): Promise<Member> {
    const [member] = await db.insert(members).values(data).returning();
    if (!member) {
      throw new Error('Failed to create member');
    }
    return member;
  },

  async findProfileById(id: string): Promise<MemberProfile | undefined> {
    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1)
      .then((rows) => rows[0]);

    if (!member) {
      return undefined;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeMembershipResult, lastCheckInResult, checkInCountResult] = await Promise.all([
      db
        .select({
          id: memberships.id,
          planId: memberships.planId,
          startDate: memberships.startDate,
          endDate: memberships.endDate,
          status: memberships.status,
          plan: plans,
        })
        .from(memberships)
        .innerJoin(plans, eq(memberships.planId, plans.id))
        .where(and(eq(memberships.memberId, id), eq(memberships.status, 'active')))
        .limit(1),
      db
        .select({ checkedInAt: checkIns.checkedInAt })
        .from(checkIns)
        .where(eq(checkIns.memberId, id))
        .orderBy(desc(checkIns.checkedInAt))
        .limit(1),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(checkIns)
        .where(and(eq(checkIns.memberId, id), gte(checkIns.checkedInAt, thirtyDaysAgo))),
    ]);

    return {
      member,
      activeMembership: activeMembershipResult[0] ?? null,
      lastCheckIn: lastCheckInResult[0]?.checkedInAt ?? null,
      checkInsLast30Days: checkInCountResult[0]?.count ?? 0,
    };
  },
};
