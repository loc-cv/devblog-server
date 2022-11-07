import { z } from 'zod';

export const newTagInputSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Tag name must be a string',
        required_error: 'Tag name is required',
      })
      .trim()
      .min(1, { message: 'Tag name is required' })
      .max(10, { message: 'Tag name character limit is 10 characters' }),

    description: z
      .string({
        invalid_type_error: 'Tag description must be a string',
        required_error: 'Tag description is required',
      })
      .trim()
      .min(1, { message: 'Tag description is required' })
      .max(100, { message: 'Tag description limit is 100 character' }),
  }),
});

export const updateTagInputSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'Tag name must be a string' })
      .trim()
      .min(1, { message: "Tag name can't be empty" })
      .max(10, { message: 'Tag name character limit is 10 characters' })
      .optional(),

    description: z
      .string({ invalid_type_error: 'Tag description must be a string' })
      .trim()
      .min(1, { message: "Tag description can't be empty" })
      .max(100, { message: 'Tag description limit is 100 character' })
      .optional(),
  }),
});

export type NewTagInput = z.infer<typeof newTagInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
