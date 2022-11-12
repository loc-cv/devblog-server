import { z } from 'zod';

export const newReportInputSchema = z.object({
  body: z.object({
    postId: z
      .string({
        invalid_type_error: 'Post ID must be a string',
        required_error: 'Post ID is required',
      })
      .min(1, { message: 'Post ID is required' }),

    reason: z
      .string({
        invalid_type_error: 'Report reason must be a string',
        required_error: 'Report reason is required',
      })
      .trim()
      .min(1, { message: 'Report reason is required' }),
  }),
});

export type NewReportInput = z.infer<typeof newReportInputSchema>;
