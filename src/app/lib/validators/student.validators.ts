import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s()]*$/;

export const enrollmentStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'WITHDRAWN']);

export const createStudentSchema = z.object({
  name: z
    .string({ message: 'Full name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters long.')
    .max(150, 'Name cannot exceed 150 characters.'),
  email: z
    .string({ message: 'Email address is required.' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(191, 'Email cannot exceed 191 characters.'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number cannot exceed 20 characters.')
    .regex(
      phoneRegex,
      'Phone number can only contain digits, spaces, +, -, and parentheses.'
    )
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === undefined ? null : val)),
  courseIds: z
    .array(z.number().int().positive())
    .min(1, 'Please select at least one active course.')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Duplicate course selections are not allowed.',
    }),
});

export const updateStudentSchema = createStudentSchema.extend({
  enrollmentStatuses: z
    .record(z.string(), enrollmentStatusEnum)
    .optional(),
});

export const studentQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .default('')
    .transform((val) => val.trim()),
  courseId: z
    .string()
    .optional()
    .transform((val) => (val && !isNaN(Number(val)) ? Number(val) : undefined)),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => Math.min(50, Math.max(1, parseInt(val, 10) || 10))),
});

export const enrollmentQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .default('')
    .transform((value) => value.trim()),
  status: enrollmentStatusEnum.optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((value) => Math.max(1, parseInt(value, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((value) => Math.min(50, Math.max(1, parseInt(value, 10) || 10))),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type EnrollmentQuery = z.infer<typeof enrollmentQuerySchema>;