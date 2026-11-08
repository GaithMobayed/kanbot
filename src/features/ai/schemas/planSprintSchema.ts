import { z } from 'zod'

export const planSprintSchema = z.object({
  capacity: z
    .number()
    .int('Capacity must be a whole number.')
    .min(1, 'Minimum 1 point.')
    .max(200, 'Maximum 200 points.'),
  focus: z
    .string()
    .max(300, 'Focus must be 300 characters or fewer.')
    .optional(),
})

export type PlanSprintFormValues = z.infer<typeof planSprintSchema>
