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

export const queryBooleanSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true');

export type Pagination = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * Creates a Zod refinement for validating date range fields.
 * Ensures fromKey <= toKey when both are present.
 */
export function dateRangeRefinement<T extends Record<string, unknown>>(
  fromKey: keyof T & string,
  toKey: keyof T & string
): {
  refinement: (data: T) => boolean;
  params: { message: string; path: string[] };
} {
  return {
    refinement: (data: T) => {
      const from = data[fromKey];
      const to = data[toKey];
      if (from && to) {
        return from <= to;
      }
      return true;
    },
    params: {
      message: `${fromKey} must be before or equal to ${toKey}`,
      path: [fromKey],
    },
  };
}
