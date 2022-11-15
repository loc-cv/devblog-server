import { z } from 'zod';

export const newPostInputSchema = z.object({
  body: z.object({
    title: z
      .string({
        invalid_type_error: 'Post title must be a string',
        required_error: 'Post title is required',
      })
      .trim()
      .min(1, { message: 'Post title is required' })
      .max(100, { message: 'Post title character limit is 100 characters' }),

    summary: z
      .string({
        invalid_type_error: 'Post summary must be a string',
        required_error: 'Post summary is required',
      })
      .trim()
      .min(1, { message: 'Post summary is required' })
      .max(200, { message: 'Post summary character limit is 200 characters' }),

    content: z
      .string({
        invalid_type_error: 'Post content must be a string',
        required_error: 'Post content is required',
      })
      .min(1, { message: 'Post content is required' }),

    tags: z
      .array(z.string(), {
        required_error: 'Post tags are required',
        invalid_type_error: 'Post tags must be an array of strings',
      })
      .min(1, { message: 'Please provide at least 1 tag' })
      .max(4, { message: 'Please provide up to 4 tags' }),
  }),
});

export const updatePostInputSchema = z.object({
  body: z.object({
    title: z
      .string({
        invalid_type_error: 'Post title must be a string',
      })
      .trim()
      .min(1, { message: "Post title can't be empty" })
      .max(100, { message: 'Post title character limit is 100 characters' })
      .optional(),

    summary: z
      .string({
        invalid_type_error: 'Post summary must be a string',
      })
      .trim()
      .min(1, { message: "Post summary can't be empty" })
      .max(200, { message: 'Post summary character limit is 200 characters' })
      .optional(),

    content: z
      .string({
        invalid_type_error: 'Post content must be a string',
      })
      .min(1, { message: "Post content can't be empty" })
      .optional(),

    tags: z
      .array(z.string(), {
        required_error: 'Post tags are required',
        invalid_type_error: 'Post tags must be an array of strings',
      })
      .min(1, { message: 'Please provide at least 1 tag' })
      .max(4, { message: 'Please provide up to 4 tags' })
      .optional(),
  }),
});

export type NewPostInput = z.infer<typeof newPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
