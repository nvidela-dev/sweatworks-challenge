import { z } from 'zod';
import {
  uuidSchema,
  dateStringSchema,
  paginationSchema,
  sortOrderSchema,
} from './common.schema.js';

export const MEMBERSHIP_STATUSES = ['active', 'cancelled', 'expired'] as const;
export const membershipStatusSchema = z.enum(MEMBERSHIP_STATUSES);

export const createMembershipSchema = z
  .object({
    memberId: uuidSchema,
    planId: uuidSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

const notInFutureDate = dateStringSchema.refine(
  (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  },
  { message: 'Cancellation date cannot be in the future' }
);

export const cancelMembershipSchema = z.object({
  cancelledAt: notInFutureDate.optional(),
});

export const membershipQuerySchema = paginationSchema.extend({
  memberId: uuidSchema.optional(),
  planId: uuidSchema.optional(),
  status: membershipStatusSchema.optional(),
  startDateFrom: dateStringSchema.optional(),
  startDateTo: dateStringSchema.optional(),
  sortBy: z.enum(['startDate', 'endDate', 'createdAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
});

export const membershipIdParamSchema = z.object({
  membershipId: uuidSchema,
});

export const memberMembershipParamsSchema = z.object({
  memberId: uuidSchema,
  membershipId: uuidSchema,
});

export type MembershipStatus = z.infer<typeof membershipStatusSchema>;
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type CancelMembershipInput = z.infer<typeof cancelMembershipSchema>;
export type MembershipQuery = z.infer<typeof membershipQuerySchema>;
export type MembershipIdParam = z.infer<typeof membershipIdParamSchema>;
export type MemberMembershipParams = z.infer<typeof memberMembershipParamsSchema>;
