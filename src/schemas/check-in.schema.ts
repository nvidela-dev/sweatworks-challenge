import { z } from 'zod';
import {
  uuidSchema,
  dateStringSchema,
  datetimeStringSchema,
  cursorPaginationSchema,
  sortOrderSchema,
} from './common.schema.js';

// ============================================
// Create Check-In Schema
// ============================================

export const createCheckInSchema = z.object({
  memberId: uuidSchema,
  membershipId: uuidSchema.optional(),
  checkedInAt: datetimeStringSchema.optional(),
});

// ============================================
// Query Parameters Schema
// ============================================

export const checkInQuerySchema = cursorPaginationSchema.extend({
  memberId: uuidSchema.optional(),
  membershipId: uuidSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  sortBy: z.enum(['checkedInAt']).default('checkedInAt'),
  sortOrder: sortOrderSchema,
});

// ============================================
// Path Parameters Schema
// ============================================

export const checkInIdParamSchema = z.object({
  checkInId: uuidSchema,
});

export const memberCheckInParamsSchema = z.object({
  memberId: uuidSchema,
  checkInId: uuidSchema,
});

// ============================================
// Inferred Types
// ============================================

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type CheckInQuery = z.infer<typeof checkInQuerySchema>;
export type CheckInIdParam = z.infer<typeof checkInIdParamSchema>;
export type MemberCheckInParams = z.infer<typeof memberCheckInParamsSchema>;
