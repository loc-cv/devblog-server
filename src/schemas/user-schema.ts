import { z } from 'zod';

export const registerFormSchema = z.object({
  body: z
    .object({
      firstName: z
        .string({
          invalid_type_error: 'First name must be a string',
          required_error: 'First name is required',
        })
        .trim()
        .min(1, { message: 'First name is required' })
        .max(30, { message: 'First name character limit is 30 characters' }),

      lastName: z
        .string({
          invalid_type_error: 'Last name must be a string',
          required_error: 'Last name is required',
        })
        .trim()
        .min(1, { message: 'Last name is required' })
        .max(30, { message: 'Last name character limit is 30 characters' }),

      email: z
        .string({ required_error: 'Email address is required' })
        .min(1, { message: 'Email address is required' })
        .email({ message: 'Invalid email address' }),

      password: z
        .string({
          invalid_type_error: 'Password must be a string',
          required_error: 'Password is required',
        })
        .min(1, { message: 'Password is required' })
        .regex(
          // https://stackoverflow.com/a/21456918
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message:
              'Password must contain at least eight characters, including at least one uppercase letter, one lowercase letter, one number and one special character.',
          },
        ),

      passwordConfirm: z
        .string({
          invalid_type_error: 'Password must be a string.',
          required_error: 'Please confirm your password',
        })
        .min(1, { message: 'Please confirm your password' }),
    })
    .refine(data => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Password confirmation does not match',
    }),
});

export const loginFormSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .min(1, { message: 'Email address is required' })
      .email({ message: 'Invalid email address' }),

    password: z
      .string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password is required',
      })
      .min(1, 'Password is required'),
  }),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
