import { z } from 'zod'

export const generateTodosSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, 'Please describe the feature (at least 3 characters).')
    .max(2000, 'Description must be 2000 characters or fewer.'),
  count: z
    .number()
    .int('Must be a whole number.')
    .min(1, 'Minimum 1.')
    .max(10, 'Maximum 10.'),
})

export type GenerateTodosFormValues = z.infer<typeof generateTodosSchema>
