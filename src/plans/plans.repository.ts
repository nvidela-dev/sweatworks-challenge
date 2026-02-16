import { and, eq, ilike, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { plans, type Plan } from '../db/schema/plans.js';
import type { PlanQuery } from '../schemas/plan.schema.js';
import { buildConditions } from '../utils/index.js';

export const plansRepository = {
  async findAll(query: PlanQuery): Promise<{ data: Plan[]; total: number }> {
    const { page, pageSize, search, isActive, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const conditions = buildConditions([
      [isActive !== undefined, () => eq(plans.isActive, isActive!)],
      [search, () => or(
        ilike(plans.name, `%${search}%`),
        ilike(plans.description, `%${search}%`)
      )],
    ]);

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
