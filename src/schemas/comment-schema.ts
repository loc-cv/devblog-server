import { z } from 'zod';

export const newCommentInputSchema = z.object({
  body: z.object({
    content: z
      .string({
        invalid_type_error: 'Comment must be a string',
        required_error: 'Comment content is required',
      })
      .trim()
      .min(1, { message: "Comment can't be empty" }),

    postId: z
      .string({
        invalid_type_error: 'Post ID must be a string',
        required_error: 'Please provide post ID that this comment belongs to',
      })
      .min(1, {
        message: 'Please provide post ID that this comment belongs to',
      }),

    parentId: z
      .string({ invalid_type_error: 'Parent comment ID must be a string' })
      .optional(),
  }),
});

export const updateCommentInputSchema = z.object({
  body: z.object({
    content: z
      .string({
        invalid_type_error: 'Comment must be a string',
        required_error: 'Updated comment content is required',
      })
      .trim()
      .min(1, { message: "Comment can't be empty" }),
  }),
});

export type NewCommentInput = z.infer<typeof newCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
