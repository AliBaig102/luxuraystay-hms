import { z } from 'zod';

// JWT Token Schema
export const jwtTokenSchema = z
  .string()
  .min(1, 'Token is required')
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
    'Invalid JWT token format'
  );

// Refresh Token Schema
export const refreshTokenSchema = z
  .string()
  .min(1, 'Refresh token is required')
  .max(500, 'Refresh token cannot exceed 500 characters');

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().default(false),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    })
    .optional(),
});

// Register Schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters'),
    phone: z
      .string()
      .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
      .optional(),
    role: z
      .enum([
        'admin',
        'manager',
        'receptionist',
        'housekeeping',
        'maintenance',
        'guest',
      ])
      .default('guest'),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
    marketingConsent: z.boolean().default(false),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Password and confirm password must match',
    path: ['confirmPassword'],
  });

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .max(100, 'New password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'],
  });

// Forgot Password Schema
export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    resetMethod: z.enum(['email', 'sms']).default('email'),
    phone: z
      .string()
      .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
      .optional(),
  })
  .refine(
    data => {
      if (data.resetMethod === 'sms' && !data.phone) {
        return false;
      }
      return true;
    },
    {
      message: 'Phone number is required when reset method is SMS',
      path: ['phone'],
    }
  );

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .max(100, 'New password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'],
  });

// Verify Email Schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Resend Verification Schema
export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
});

// Refresh Token Schema
export const refreshTokenRequestSchema = z.object({
  refreshToken: refreshTokenSchema,
});

// Logout Schema
export const logoutSchema = z.object({
  refreshToken: refreshTokenSchema.optional(),
  logoutAllDevices: z.boolean().default(false),
});

// Two-Factor Authentication Schema
export const twoFactorAuthSchema = z.object({
  code: z
    .string()
    .min(6, '2FA code must be at least 6 characters')
    .max(6, '2FA code cannot exceed 6 characters')
    .regex(/^\d{6}$/, '2FA code must be 6 digits'),
  rememberDevice: z.boolean().default(false),
});

// Enable 2FA Schema
export const enable2FASchema = z
  .object({
    method: z.enum(['totp', 'sms', 'email']).default('totp'),
    phone: z
      .string()
      .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
  })
  .refine(
    data => {
      if (data.method === 'sms' && !data.phone) {
        return false;
      }
      if (data.method === 'email' && !data.email) {
        return false;
      }
      return true;
    },
    {
      message:
        'Phone number is required when 2FA method is SMS, email is required when 2FA method is email',
    }
  );

// Disable 2FA Schema
export const disable2FASchema = z.object({
  code: z
    .string()
    .min(6, '2FA code must be at least 6 characters')
    .max(6, '2FA code cannot exceed 6 characters')
    .regex(/^\d{6}$/, '2FA code must be 6 digits'),
  password: z.string().min(1, 'Password is required'),
});

// Session Management Schema
export const sessionManagementSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  action: z.enum(['revoke', 'extend', 'info']),
  extendDuration: z
    .number()
    .int()
    .min(1, 'Extension duration must be at least 1 minute')
    .max(1440, 'Extension duration cannot exceed 1440 minutes (24 hours)')
    .optional(),
});

// Export all schemas
export const authValidationSchemas = {
  login: loginSchema,
  register: registerSchema,
  changePassword: changePasswordSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  verifyEmail: verifyEmailSchema,
  resendVerification: resendVerificationSchema,
  refreshToken: refreshTokenRequestSchema,
  logout: logoutSchema,
  twoFactorAuth: twoFactorAuthSchema,
  enable2FA: enable2FASchema,
  disable2FA: disable2FASchema,
  sessionManagement: sessionManagementSchema,
};
