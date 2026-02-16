import { and, eq, gte, lte, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { checkIns, type CheckIn, type NewCheckIn } from '../db/schema/check-ins.js';
import type { CheckInQuery } from '../schemas/check-in.schema.js';
import { buildConditions } from '../utils/index.js';

export const checkInsRepository = {
  async findAll(query: CheckInQuery): Promise<{ data: CheckIn[]; total: number }> {
    const { page, pageSize, memberId, membershipId, dateFrom, dateTo, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const conditions = buildConditions([
      [memberId, () => eq(checkIns.memberId, memberId!)],
      [membershipId, () => eq(checkIns.membershipId, membershipId!)],
      [dateFrom, () => gte(checkIns.checkedInAt, new Date(dateFrom!))],
      [dateTo, () => lte(checkIns.checkedInAt, new Date(`${dateTo!}T23:59:59.999Z`))],
    ]);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderDirection = sortOrder === 'asc' ? asc : desc;
    const orderColumn = checkIns[sortBy];

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(checkIns)
        .where(whereClause)
        .orderBy(orderDirection(orderColumn))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(checkIns)
        .where(whereClause),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<CheckIn | undefined> {
    const result = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.id, id))
      .limit(1);
    return result[0];
  },

  async create(data: NewCheckIn): Promise<CheckIn> {
    const [checkIn] = await db.insert(checkIns).values(data).returning();
    if (!checkIn) {
      throw new Error('Failed to create check-in');
    }
    return checkIn;
  },
};
