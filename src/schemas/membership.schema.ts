import { z } from 'zod';
import {
  uuidSchema,
  dateStringSchema,
  cursorPaginationSchema,
  sortOrderSchema,
} from './common.schema.js';

// ============================================
// Membership Status Enum
// ============================================

export const MEMBERSHIP_STATUSES = ['active', 'cancelled', 'expired'] as const;
export const membershipStatusSchema = z.enum(MEMBERSHIP_STATUSES);

// ============================================
// Create Membership Schema
// ============================================

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

// ============================================
// Cancel Membership Schema
// ============================================

export const cancelMembershipSchema = z.object({
  cancelledAt: dateStringSchema.optional(),
});

// ============================================
// Query Parameters Schema
// ============================================

export const membershipQuerySchema = cursorPaginationSchema.extend({
  memberId: uuidSchema.optional(),
  planId: uuidSchema.optional(),
  status: membershipStatusSchema.optional(),
  startDateFrom: dateStringSchema.optional(),
  startDateTo: dateStringSchema.optional(),
  sortBy: z.enum(['startDate', 'endDate', 'createdAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
});

// ============================================
// Path Parameters Schema
// ============================================

export const membershipIdParamSchema = z.object({
  membershipId: uuidSchema,
});

export const memberMembershipParamsSchema = z.object({
  memberId: uuidSchema,
  membershipId: uuidSchema,
});

// ============================================
// Inferred Types
// ============================================

export type MembershipStatus = z.infer<typeof membershipStatusSchema>;
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type CancelMembershipInput = z.infer<typeof cancelMembershipSchema>;
export type MembershipQuery = z.infer<typeof membershipQuerySchema>;
export type MembershipIdParam = z.infer<typeof membershipIdParamSchema>;
export type MemberMembershipParams = z.infer<typeof memberMembershipParamsSchema>;
