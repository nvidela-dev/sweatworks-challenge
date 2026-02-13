import { z } from 'zod';

// ============================================
// Common Field Schemas
// ============================================

export const uuidSchema = z.string().uuid();

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const datetimeStringSchema = z.string().datetime({ offset: true });

export const emailSchema = z
  .string()
  .email()
  .max(255)
  .transform((val) => val.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .max(20)
  .regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
  .optional()
  .nullable();

// ============================================
// Pagination Schemas
// ============================================

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const offsetPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// ============================================
// Inferred Types
// ============================================

export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
export type OffsetPagination = z.infer<typeof offsetPaginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
