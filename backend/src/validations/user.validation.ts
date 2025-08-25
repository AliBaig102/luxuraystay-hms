import { z } from 'zod';

// User Role Enum
export const userRoleSchema = z.enum([
  'admin',
  'manager',
  'receptionist',
  'housekeeping',
  'maintenance',
  'guest',
]);

// Base User Schema
export const userSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
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
    .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  role: userRoleSchema.default('guest'),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  profileImage: z.string().url('Please enter a valid URL').optional(),
});

// User Update Schema (partial, no password)
export const userUpdateSchema = userSchema.partial().omit({ password: true });

// User Login Schema
export const userLoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// User Profile Schema
export const userProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  address: z
    .string()
    .max(200, 'Address cannot exceed 200 characters')
    .optional(),
  dateOfBirth: z.date().optional(),
  nationality: z
    .string()
    .max(50, 'Nationality cannot exceed 50 characters')
    .optional(),
  idProof: z
    .string()
    .max(100, 'ID proof cannot exceed 100 characters')
    .optional(),
  emergencyContact: z
    .object({
      name: z
        .string()
        .min(1, 'Emergency contact name is required')
        .max(50, 'Name cannot exceed 50 characters'),
      relationship: z
        .string()
        .min(1, 'Relationship is required')
        .max(30, 'Relationship cannot exceed 30 characters'),
      phone: z
        .string()
        .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
    })
    .optional(),
  preferences: z
    .object({
      roomType: z
        .string()
        .max(30, 'Room type cannot exceed 30 characters')
        .optional(),
      floor: z.string().max(10, 'Floor cannot exceed 10 characters').optional(),
      amenities: z
        .array(z.string())
        .max(20, 'Cannot have more than 20 amenities')
        .optional(),
      specialRequests: z
        .string()
        .max(500, 'Special requests cannot exceed 500 characters')
        .optional(),
    })
    .optional(),
});

// User Profile Update Schema
export const userProfileUpdateSchema = userProfileSchema.partial();

// User Search Schema
export const userSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'role', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// User Filter Schema
export const userFilterSchema = z.object({
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['firstName', 'lastName', 'email', 'role', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'],
  });

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'],
  });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

// Export all schemas
export const userValidationSchemas = {
  user: userSchema,
  userUpdate: userUpdateSchema,
  userLogin: userLoginSchema,
  userProfile: userProfileSchema,
  userProfileUpdate: userProfileUpdateSchema,
  userSearch: userSearchSchema,
  userFilter: userFilterSchema,
  changePassword: changePasswordSchema,
  resetPassword: resetPasswordSchema,
  forgotPassword: forgotPasswordSchema,
};
