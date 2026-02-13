import { z } from 'zod';
import {
  uuidSchema,
  dateStringSchema,
  datetimeStringSchema,
  paginationSchema,
  sortOrderSchema,
} from './common.schema.js';

export const createCheckInSchema = z.object({
  memberId: uuidSchema,
  membershipId: uuidSchema.optional(),
  checkedInAt: datetimeStringSchema.optional(),
});

export const checkInQuerySchema = paginationSchema.extend({
  memberId: uuidSchema.optional(),
  membershipId: uuidSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  sortBy: z.enum(['checkedInAt']).default('checkedInAt'),
  sortOrder: sortOrderSchema,
});

export const checkInIdParamSchema = z.object({
  checkInId: uuidSchema,
});

export const memberCheckInParamsSchema = z.object({
  memberId: uuidSchema,
  checkInId: uuidSchema,
});

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type CheckInQuery = z.infer<typeof checkInQuerySchema>;
export type CheckInIdParam = z.infer<typeof checkInIdParamSchema>;
export type MemberCheckInParams = z.infer<typeof memberCheckInParamsSchema>;
