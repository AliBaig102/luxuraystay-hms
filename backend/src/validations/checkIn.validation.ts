import { z } from 'zod';

// Check-in Status Enum
export const checkInStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

// Base Check-in Schema
export const checkInSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  guestId: z.string().min(1, 'Guest ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  checkInTime: z.date().min(new Date(), 'Check-in time must be in the future'),
  expectedCheckOutTime: z
    .date()
    .min(new Date(), 'Expected check-out time must be in the future'),
  actualCheckInTime: z.date().optional(),
  numberOfGuests: z
    .number()
    .int()
    .min(1, 'Number of guests must be at least 1')
    .max(10, 'Number of guests cannot exceed 10'),
  status: checkInStatusSchema.default('pending'),
  specialRequests: z
    .string()
    .max(1000, 'Special requests cannot exceed 1000 characters')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Check-in Update Schema
export const checkInUpdateSchema = checkInSchema.partial().omit({
  reservationId: true,
  guestId: true,
  roomId: true,
});

// Check-in Search Schema
export const checkInSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query cannot exceed 100 characters')
    .optional(),
  status: checkInStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['checkInTime', 'expectedCheckOutTime', 'createdAt', 'status'])
    .default('checkInTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Check-in Filter Schema
export const checkInFilterSchema = z.object({
  status: checkInStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['checkInTime', 'expectedCheckOutTime', 'createdAt', 'status'])
    .default('checkInTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Check-in Completion Schema
export const checkInCompletionSchema = z.object({
  checkInId: z.string().min(1, 'Check-in ID is required'),
  actualCheckInTime: z
    .date()
    .min(new Date(), 'Actual check-in time must be in the future'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const checkInValidationSchemas = {
  checkIn: checkInSchema,
  checkInUpdate: checkInUpdateSchema,
  checkInSearch: checkInSearchSchema,
  checkInFilter: checkInFilterSchema,
  checkInCompletion: checkInCompletionSchema,
};
