import { and, eq, gte, lte, asc, desc, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '../db/client.js';
import { memberships, type Membership, type NewMembership } from '../db/schema/memberships.js';
import type { MembershipQuery } from '../schemas/membership.schema.js';

export const membershipsRepository = {
  async findAll(query: MembershipQuery): Promise<{ data: Membership[]; total: number }> {
    const { page, pageSize, memberId, planId, status, startDateFrom, startDateTo, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];

    if (memberId) {
      conditions.push(eq(memberships.memberId, memberId));
    }

    if (planId) {
      conditions.push(eq(memberships.planId, planId));
    }

    if (status) {
      conditions.push(eq(memberships.status, status));
    }

    if (startDateFrom) {
      conditions.push(gte(memberships.startDate, startDateFrom));
    }

    if (startDateTo) {
      conditions.push(lte(memberships.startDate, startDateTo));
    }

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
      throw new Error('Failed to create membership');
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
      throw new Error('Failed to cancel membership');
    }
    return membership;
  },
};
