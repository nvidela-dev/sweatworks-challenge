import { relations } from 'drizzle-orm';
import { members } from './members';
import { plans } from './plans';
import { memberships } from './memberships';
import { checkIns } from './check-ins';

export const membersRelations = relations(members, ({ many }) => ({
  memberships: many(memberships),
  checkIns: many(checkIns),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  member: one(members, {
    fields: [memberships.memberId],
    references: [members.id],
  }),
  plan: one(plans, {
    fields: [memberships.planId],
    references: [plans.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  member: one(members, {
    fields: [checkIns.memberId],
    references: [members.id],
  }),
  membership: one(memberships, {
    fields: [checkIns.membershipId],
    references: [memberships.id],
  }),
}));
