import { pgTable, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { members } from './members';
import { memberships } from './memberships';

export const checkIns = pgTable(
  'check_ins',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
  },
  (table) => ({
    memberIdIdx: index('idx_check_ins_member_id').on(table.memberId),
    checkedInAtIdx: index('idx_check_ins_checked_in_at').on(table.checkedInAt),
  })
);

export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
