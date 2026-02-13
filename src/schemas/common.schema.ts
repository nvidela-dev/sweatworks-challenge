import { z } from 'zod';

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

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export type Pagination = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
