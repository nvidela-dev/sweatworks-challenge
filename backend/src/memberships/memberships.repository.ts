import { and, eq, gte, lte, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { memberships, type Membership, type NewMembership } from '../db/schema/memberships.js';
import type { MembershipQuery } from '../schemas/membership.schema.js';
import { buildConditions } from '../utils/index.js';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';

export const membershipsRepository = {
  async findAll(query: MembershipQuery): Promise<{ data: Membership[]; total: number }> {
    const { page, pageSize, memberId, planId, status, startDateFrom, startDateTo, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const conditions = buildConditions([
      [memberId, () => eq(memberships.memberId, memberId!)],
      [planId, () => eq(memberships.planId, planId!)],
      [status, () => eq(memberships.status, status!)],
      [startDateFrom, () => gte(memberships.startDate, startDateFrom!)],
      [startDateTo, () => lte(memberships.startDate, startDateTo!)],
    ]);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderDirection = sortOrder === 'asc' ? asc : desc;
    const orderColumn = memberships[sortBy];

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(memberships)
        .where(whereClause)
        .orderBy(orderDirection(orderColumn))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(memberships)
        .where(whereClause),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<Membership | undefined> {
    const result = await db
      .select()
      .from(memberships)
      .where(eq(memberships.id, id))
      .limit(1);
    return result[0];
  },

  async findActiveByMemberId(memberId: string): Promise<Membership | undefined> {
    const result = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.memberId, memberId), eq(memberships.status, 'active')))
      .limit(1);
    return result[0];
  },

  async create(data: NewMembership): Promise<Membership> {
    const [membership] = await db.insert(memberships).values(data).returning();
    if (!membership) {
      throw new HttpError(ErrorCode.DATABASE_ERROR, 'Failed to create membership', 500);
    }
    return membership;
  },

  async cancel(id: string, cancelledAt: string): Promise<Membership> {
    const [membership] = await db
      .update(memberships)
      .set({ status: 'cancelled', cancelledAt, updatedAt: new Date() })
      .where(eq(memberships.id, id))
      .returning();
    if (!membership) {
      throw new HttpError(ErrorCode.DATABASE_ERROR, 'Failed to cancel membership', 500);
    }
    return membership;
  },
};
