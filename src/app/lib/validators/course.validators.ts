import { z } from 'zod';

export const createCourseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Course code must be at least 2 characters.')
    .max(20, 'Course code cannot exceed 20 characters.')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
      'Use letters, numbers, and hyphens only.'
    )
    .transform((value) => value.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Course name must be at least 2 characters.')
    .max(150, 'Course name cannot exceed 150 characters.'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters.')
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  isActive: z.boolean().default(true),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
