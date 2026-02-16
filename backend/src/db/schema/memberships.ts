import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { members } from './members';
import { plans } from './plans';

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    cancelledAt: date('cancelled_at'),
    status: varchar('status', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
  },
  (table) => ({
    statusValid: check(
      'status_valid',
      sql`${table.status} IN ('active', 'cancelled', 'expired')`
    ),
    datesValid: check('dates_valid', sql`${table.startDate} < ${table.endDate}`),
    memberIdIdx: index('idx_memberships_member_id').on(table.memberId),
    memberActiveIdx: uniqueIndex('idx_memberships_member_active')
      .on(table.memberId)
      .where(sql`status = 'active'`),
  })
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
