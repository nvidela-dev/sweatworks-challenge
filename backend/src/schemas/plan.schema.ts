import { z } from 'zod';
import {
  uuidSchema,
  paginationSchema,
  sortOrderSchema,
  queryBooleanSchema,
} from './common.schema.js';

export const createPlanSchema = z.object({
  name: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Plan name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .trim()
    .optional()
    .nullable(),
  priceCents: z
    .number()
    .int('Price must be a whole number of cents')
    .min(0, 'Price cannot be negative'),
  durationDays: z
    .number()
    .int('Duration must be a whole number of days')
    .min(1, 'Duration must be at least 1 day'),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(1000).trim().optional().nullable(),
  priceCents: z.number().int().min(0).optional(),
  durationDays: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const planQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  isActive: queryBooleanSchema.optional(),
  sortBy: z
    .enum(['name', 'priceCents', 'durationDays', 'createdAt'])
    .default('createdAt'),
  sortOrder: sortOrderSchema,
});

export const planIdParamSchema = z.object({
  planId: uuidSchema,
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanQuery = z.infer<typeof planQuerySchema>;
export type PlanIdParam = z.infer<typeof planIdParamSchema>;
