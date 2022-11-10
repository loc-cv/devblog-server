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
      .string({
        invalid_type_error:
          'Post tags is a string which contains a list of tag names, separated by space',
        required_error: 'Post tags are required',
      })
      .min(1, { message: 'Post tags are required' }),
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
      .string({
        invalid_type_error:
          'Post tags is a string which contains a list of tag names, separated by space',
      })
      .min(1, { message: "Post tags can't be empty" })
      .optional(),
  }),
});

export type NewPostInput = z.infer<typeof newPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
