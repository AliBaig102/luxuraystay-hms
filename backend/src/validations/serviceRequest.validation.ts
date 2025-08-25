import { z } from 'zod';

// Service Request Status Enum
export const serviceRequestStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]);

// Service Request Priority Enum
export const serviceRequestPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

// Service Request Type Enum
export const serviceRequestTypeSchema = z.enum([
  'room_service',
  'laundry',
  'housekeeping',
  'maintenance',
  'transportation',
  'wake_up_call',
  'concierge',
  'spa',
  'gym',
  'other',
]);

// Base Service Request Schema
export const serviceRequestSchema = z.object({
  guestId: z.string().min(1, 'Guest ID is required'),
  reservationId: z.string().min(1, 'Reservation ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  serviceType: serviceRequestTypeSchema,
  priority: serviceRequestPrioritySchema.default('medium'),
  status: serviceRequestStatusSchema.default('pending'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  requestedDate: z
    .date()
    .min(new Date(), 'Requested date must be in the future'),
  preferredTime: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please enter a valid time in HH:MM format'
    )
    .optional(),
  estimatedCost: z
    .number()
    .min(0, 'Estimated cost cannot be negative')
    .max(10000, 'Estimated cost cannot exceed 10000')
    .optional(),
  assignedTo: z.string().optional(),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future')
    .optional(),
  actualStartTime: z.date().optional(),
  actualEndTime: z.date().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  isActive: z.boolean().default(true),
});

// Service Request Update Schema
export const serviceRequestUpdateSchema = serviceRequestSchema.partial().omit({
  guestId: true,
  reservationId: true,
  roomId: true,
});

// Service Request Search Schema
export const serviceRequestSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: serviceRequestStatusSchema.optional(),
  priority: serviceRequestPrioritySchema.optional(),
  serviceType: serviceRequestTypeSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  assignedTo: z.string().optional(),
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
    .enum(['requestedDate', 'priority', 'scheduledDate', 'createdAt', 'status'])
    .default('requestedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Service Request Filter Schema
export const serviceRequestFilterSchema = z.object({
  status: serviceRequestStatusSchema.optional(),
  priority: serviceRequestPrioritySchema.optional(),
  serviceType: serviceRequestTypeSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['requestedDate', 'priority', 'scheduledDate', 'createdAt', 'status'])
    .default('requestedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Service Request Assignment Schema
export const serviceRequestAssignmentSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  assignedTo: z.string().min(1, 'Assigned staff ID is required'),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Service Request Status Update Schema
export const serviceRequestStatusUpdateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  status: serviceRequestStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Service Request Completion Schema
export const serviceRequestCompletionSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  actualEndTime: z
    .date()
    .min(new Date(), 'Actual end time must be in the future'),
  actualCost: z
    .number()
    .min(0, 'Actual cost cannot be negative')
    .max(10000, 'Actual cost cannot exceed 10000')
    .optional(),
  completionNotes: z
    .string()
    .max(1000, 'Completion notes cannot exceed 1000 characters')
    .optional(),
});

// Export all schemas
export const serviceRequestValidationSchemas = {
  serviceRequest: serviceRequestSchema,
  serviceRequestUpdate: serviceRequestUpdateSchema,
  serviceRequestSearch: serviceRequestSearchSchema,
  serviceRequestFilter: serviceRequestFilterSchema,
  serviceRequestAssignment: serviceRequestAssignmentSchema,
  serviceRequestStatusUpdate: serviceRequestStatusUpdateSchema,
  serviceRequestCompletion: serviceRequestCompletionSchema,
};
