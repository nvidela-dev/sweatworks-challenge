import { pgTable, uuid, varchar, text, integer, boolean, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const plans = pgTable(
  'plans',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    durationDays: integer('duration_days').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
  },
  (table) => ({
    priceCentsPositive: check('price_cents_positive', sql`${table.priceCents} >= 0`),
    durationDaysPositive: check('duration_days_positive', sql`${table.durationDays} > 0`),
  })
);

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
