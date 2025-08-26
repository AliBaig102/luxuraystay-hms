import { z } from 'zod';

// Reservation Status Enum
export const reservationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show',
]);

// Payment Status Enum
export const paymentStatusSchema = z.enum([
  'pending',
  'partial',
  'paid',
  'refunded',
  'failed',
]);

// Base Reservation Schema
export const reservationSchema = z.object({
  guestId: z.string().min(1, 'Guest ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  checkInDate: z.date().min(new Date(), 'Check-in date must be in the future'),
  checkOutDate: z
    .date()
    .min(new Date(), 'Check-out date must be in the future'),
  numberOfGuests: z
    .number()
    .int()
    .min(1, 'Number of guests must be at least 1')
    .max(10, 'Number of guests cannot exceed 10'),
  totalAmount: z
    .number()
    .min(0, 'Total amount cannot be negative')
    .max(100000, 'Total amount cannot exceed 100000'),
  status: reservationStatusSchema.default('pending'),
  paymentStatus: paymentStatusSchema.default('pending'),
  specialRequests: z
    .string()
    .max(1000, 'Special requests cannot exceed 1000 characters')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Reservation Update Schema
export const reservationUpdateSchema = reservationSchema.partial().omit({
  guestId: true,
  roomId: true,
});

// Reservation Search Schema
export const reservationSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: reservationStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
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
    .enum(['checkInDate', 'checkOutDate', 'totalAmount', 'createdAt', 'status'])
    .default('checkInDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Reservation Filter Schema
export const reservationFilterSchema = z.object({
  status: reservationStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount cannot be negative').optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['checkInDate', 'checkOutDate', 'totalAmount', 'createdAt', 'status'])
    .default('checkInDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Reservation Availability Schema
export const reservationAvailabilitySchema = z.object({
  checkInDate: z.date().min(new Date(), 'Check-in date must be in the future'),
  checkOutDate: z
    .date()
    .min(new Date(), 'Check-out date must be in the future'),
  roomType: z.enum(['standard', 'deluxe', 'suite', 'presidential']).optional(),
  numberOfGuests: z
    .number()
    .int()
    .min(1, 'Number of guests must be at least 1')
    .max(10, 'Number of guests cannot exceed 10')
    .optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
});

// Reservation Confirmation Schema
export const reservationConfirmationSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  confirmationNotes: z
    .string()
    .max(500, 'Confirmation notes cannot exceed 500 characters')
    .optional(),
});

// Reservation Cancellation Schema
export const reservationCancellationSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  cancellationReason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
  refundAmount: z
    .number()
    .min(0, 'Refund amount cannot be negative')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Reservation Deletion Schema
export const reservationDeletionSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  deletionReason: z
    .string()
    .min(1, 'Deletion reason is required')
    .max(500, 'Deletion reason cannot exceed 500 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const reservationValidationSchemas = {
  reservation: reservationSchema,
  reservationUpdate: reservationUpdateSchema,
  reservationSearch: reservationSearchSchema,
  reservationFilter: reservationFilterSchema,
  reservationAvailability: reservationAvailabilitySchema,
  reservationConfirmation: reservationConfirmationSchema,
  reservationCancellation: reservationCancellationSchema,
  deleteReservation: reservationDeletionSchema,
};
