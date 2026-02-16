import { and, eq, ilike, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { members, type Member, type NewMember } from '../db/schema/members.js';
import type { MemberQuery } from '../schemas/member.schema.js';
import { buildConditions } from '../utils/index.js';

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
};
