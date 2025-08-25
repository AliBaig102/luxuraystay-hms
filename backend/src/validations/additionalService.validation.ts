import { z } from 'zod';

// Additional Service Status Enum
export const additionalServiceStatusSchema = z.enum([
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]);

// Additional Service Type Enum
export const additionalServiceTypeSchema = z.enum([
  'food',
  'beverage',
  'laundry',
  'spa',
  'gym',
  'transportation',
  'concierge',
  'cleaning',
  'maintenance',
  'other',
]);

// Base Additional Service Schema
export const additionalServiceSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  guestId: z.string().min(1, 'Guest ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  serviceType: additionalServiceTypeSchema,
  serviceName: z
    .string()
    .min(1, 'Service name is required')
    .max(200, 'Service name cannot exceed 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .max(10000, 'Unit price cannot exceed 10000'),
  totalPrice: z
    .number()
    .min(0, 'Total price cannot be negative')
    .max(100000, 'Total price cannot exceed 100000'),
  status: additionalServiceStatusSchema.default('pending'),
  requestedDate: z
    .date()
    .min(new Date(), 'Requested date must be in the future'),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future')
    .optional(),
  actualStartTime: z.date().optional(),
  actualEndTime: z.date().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Additional Service Update Schema
export const additionalServiceUpdateSchema = additionalServiceSchema
  .partial()
  .omit({
    reservationId: true,
    guestId: true,
    roomId: true,
  });

// Additional Service Search Schema
export const additionalServiceSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: additionalServiceStatusSchema.optional(),
  serviceType: additionalServiceTypeSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum([
      'requestedDate',
      'scheduledDate',
      'totalPrice',
      'createdAt',
      'status',
    ])
    .default('requestedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Additional Service Filter Schema
export const additionalServiceFilterSchema = z.object({
  status: additionalServiceStatusSchema.optional(),
  serviceType: additionalServiceTypeSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum([
      'requestedDate',
      'scheduledDate',
      'totalPrice',
      'createdAt',
      'status',
    ])
    .default('requestedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Additional Service Status Update Schema
export const additionalServiceStatusUpdateSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  status: additionalServiceStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Additional Service Completion Schema
export const additionalServiceCompletionSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  actualEndTime: z
    .date()
    .min(new Date(), 'Actual end time must be in the future'),
  actualCost: z
    .number()
    .min(0, 'Actual cost cannot be negative')
    .max(100000, 'Actual cost cannot exceed 100000')
    .optional(),
  completionNotes: z
    .string()
    .max(500, 'Completion notes cannot exceed 500 characters')
    .optional(),
});

// Export all schemas
export const additionalServiceValidationSchemas = {
  additionalService: additionalServiceSchema,
  additionalServiceUpdate: additionalServiceUpdateSchema,
  additionalServiceSearch: additionalServiceSearchSchema,
  additionalServiceFilter: additionalServiceFilterSchema,
  additionalServiceStatusUpdate: additionalServiceStatusUpdateSchema,
  additionalServiceCompletion: additionalServiceCompletionSchema,
};
