import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Enter a valid email.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const emailSchema = z.object({
  email: z.string().email('Enter a valid email.'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(6, 'Token is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(6, 'Verification token is required.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type EmailValues = z.infer<typeof emailSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
