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

export const updateUserInputSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        invalid_type_error: 'First name must be a string',
      })
      .trim()
      .min(1, { message: "First name can't be empty" })
      .max(30, { message: 'First name character limit is 30 characters' })
      .optional(),

    lastName: z
      .string({
        invalid_type_error: 'Last name must be a string',
      })
      .trim()
      .min(1, { message: "Last name can't be empty" })
      .max(30, { message: 'Last name character limit is 30 characters' })
      .optional(),

    bio: z
      .string({ invalid_type_error: 'Bio must be a string' })
      .trim()
      .min(1, { message: "Bio can't be empty" })
      .max(150, 'Bio character limit is 150 characters')
      .optional(),

    username: z
      .string({ invalid_type_error: 'Username must be a string' })
      .trim()
      .min(3, { message: 'Username must have at least 3 characters' })
      .max(30, { message: 'Username character limit is 30 characters' })
      .regex(/^[a-zA-Z][a-zA-Z0-9]*/, {
        message:
          "Username can only contain alpha numeric character, and can't start with a number",
      })
      .optional(),
  }),
});

export const updatePasswordInputSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({
          invalid_type_error: 'Current password must be a string',
          required_error: 'Current password is required',
        })
        .min(1, { message: 'Current password is required' }),

      newPassword: z
        .string({
          invalid_type_error: 'New password must be a string',
          required_error: 'Please enter your new password',
        })
        .min(1, { message: 'Please enter your new password' })
        .regex(
          // https://stackoverflow.com/a/21456918
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message:
              'Password must contain at least eight characters, including at least one uppercase letter, one lowercase letter, one number and one special character.',
          },
        ),

      newPasswordConfirm: z
        .string({
          invalid_type_error: 'Password must be a string.',
          required_error: 'Please confirm your password',
        })
        .min(1, { message: 'Please confirm your password' }),
    })
    .refine(data => data.newPassword === data.newPasswordConfirm, {
      path: ['newPasswordConfirm'],
      message: 'Password confirmation does not match',
    }),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>;
