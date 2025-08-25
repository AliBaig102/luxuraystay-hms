import { z } from 'zod';

// Check-out Status Enum
export const checkOutStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

// Base Check-out Schema
export const checkOutSchema = z.object({
  checkInId: z.string().min(1, 'Check-in ID is required'),
  guestId: z.string().min(1, 'Guest ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  expectedCheckOutTime: z
    .date()
    .min(new Date(), 'Expected check-out time must be in the future'),
  actualCheckOutTime: z.date().optional(),
  numberOfGuests: z
    .number()
    .int()
    .min(1, 'Number of guests must be at least 1')
    .max(10, 'Number of guests cannot exceed 10'),
  status: checkOutStatusSchema.default('pending'),
  lateCheckOut: z.boolean().default(false),
  lateCheckOutFee: z
    .number()
    .min(0, 'Late check-out fee cannot be negative')
    .max(1000, 'Late check-out fee cannot exceed 1000')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Check-out Update Schema
export const checkOutUpdateSchema = checkOutSchema.partial().omit({
  checkInId: true,
  guestId: true,
  roomId: true,
});

// Check-out Search Schema
export const checkOutSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: checkOutStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
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
    .enum(['expectedCheckOutTime', 'actualCheckOutTime', 'createdAt', 'status'])
    .default('expectedCheckOutTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Check-out Filter Schema
export const checkOutFilterSchema = z.object({
  status: checkOutStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  lateCheckOut: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['expectedCheckOutTime', 'actualCheckOutTime', 'createdAt', 'status'])
    .default('expectedCheckOutTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Check-out Completion Schema
export const checkOutCompletionSchema = z.object({
  checkOutId: z.string().min(1, 'Check-out ID is required'),
  actualCheckOutTime: z
    .date()
    .min(new Date(), 'Actual check-out time must be in the future'),
  lateCheckOutFee: z
    .number()
    .min(0, 'Late check-out fee cannot be negative')
    .max(1000, 'Late check-out fee cannot exceed 1000')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const checkOutValidationSchemas = {
  checkOut: checkOutSchema,
  checkOutUpdate: checkOutUpdateSchema,
  checkOutSearch: checkOutSearchSchema,
  checkOutFilter: checkOutFilterSchema,
  checkOutCompletion: checkOutCompletionSchema,
};
