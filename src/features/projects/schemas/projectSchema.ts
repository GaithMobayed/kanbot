import { z } from 'zod'


export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name must be 80 characters or fewer'),

  key: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => val === '' || /^[A-Z]{2,6}$/.test(val), {
      message: 'Key must be 2–6 letters',
    }),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer'),
})

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>
