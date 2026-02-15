import { and, eq, ilike, or, asc, desc, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '../db/client.js';
import { plans, type Plan } from '../db/schema/plans.js';
import type { PlanQuery } from '../schemas/plan.schema.js';

export const plansRepository = {
  async findAll(query: PlanQuery): Promise<{ data: Plan[]; total: number }> {
    const { page, pageSize, search, isActive, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];

    if (isActive !== undefined) {
      conditions.push(eq(plans.isActive, isActive));
    }

    if (search) {
      const searchCondition = or(
        ilike(plans.name, `%${search}%`),
        ilike(plans.description, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderDirection = sortOrder === 'asc' ? asc : desc;
    const orderColumn = plans[sortBy];

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(plans)
        .where(whereClause)
        .orderBy(orderDirection(orderColumn))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(plans)
        .where(whereClause),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  },
};
