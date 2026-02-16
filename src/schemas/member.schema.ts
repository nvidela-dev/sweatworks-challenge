import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  paginationSchema,
  sortOrderSchema,
  queryBooleanSchema,
} from './common.schema.js';

export const createMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim(),
  email: emailSchema,
  phone: phoneSchema,
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

export const memberQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'createdAt'])
    .default('createdAt'),
  sortOrder: sortOrderSchema,
  includeDeleted: queryBooleanSchema.optional().default(false),
});

export const memberIdParamSchema = z.object({
  memberId: uuidSchema,
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberQuery = z.infer<typeof memberQuerySchema>;
export type MemberIdParam = z.infer<typeof memberIdParamSchema>;
