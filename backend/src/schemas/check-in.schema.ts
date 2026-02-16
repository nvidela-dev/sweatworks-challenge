import { z } from 'zod';
import {
  uuidSchema,
  dateStringSchema,
  datetimeStringSchema,
  paginationSchema,
  sortOrderSchema,
  dateRangeRefinement,
} from './common.schema.js';

// For nested route: POST /api/members/:memberId/check-ins
// memberId comes from URL params, not body
export const createCheckInBodySchema = z.object({
  checkedInAt: datetimeStringSchema.optional(),
});

const checkInQueryBase = paginationSchema.extend({
  memberId: uuidSchema.optional(),
  membershipId: uuidSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  sortBy: z.enum(['checkedInAt']).default('checkedInAt'),
  sortOrder: sortOrderSchema,
});

const { refinement, params } = dateRangeRefinement<z.infer<typeof checkInQueryBase>>(
  'dateFrom',
  'dateTo'
);
export const checkInQuerySchema = checkInQueryBase.refine(refinement, params);

export const checkInIdParamSchema = z.object({
  checkInId: uuidSchema,
});

export const memberCheckInParamsSchema = z.object({
  memberId: uuidSchema,
  checkInId: uuidSchema,
});

export type CreateCheckInBody = z.infer<typeof createCheckInBodySchema>;
export type CheckInQuery = z.infer<typeof checkInQuerySchema>;
export type CheckInIdParam = z.infer<typeof checkInIdParamSchema>;
export type MemberCheckInParams = z.infer<typeof memberCheckInParamsSchema>;
