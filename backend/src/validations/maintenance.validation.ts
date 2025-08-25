import { z } from 'zod';

// Maintenance Status Enum
export const maintenanceStatusSchema = z.enum([
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold',
]);

// Maintenance Priority Enum
export const maintenancePrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

// Maintenance Type Enum
export const maintenanceTypeSchema = z.enum([
  'electrical',
  'plumbing',
  'hvac',
  'structural',
  'appliance',
  'furniture',
  'other',
]);

// Base Maintenance Request Schema
export const maintenanceRequestSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  reportedBy: z.string().min(1, 'Reporter ID is required'),
  assignedTo: z.string().optional(),
  maintenanceType: maintenanceTypeSchema,
  priority: maintenancePrioritySchema.default('medium'),
  status: maintenanceStatusSchema.default('pending'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  estimatedCost: z
    .number()
    .min(0, 'Estimated cost cannot be negative')
    .max(10000, 'Estimated cost cannot exceed 10000')
    .optional(),
  estimatedDuration: z
    .number()
    .int()
    .min(1, 'Estimated duration must be at least 1 hour')
    .max(720, 'Estimated duration cannot exceed 720 hours (30 days)')
    .optional(),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future')
    .optional(),
  actualStartTime: z.date().optional(),
  actualEndTime: z.date().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  isActive: z.boolean().default(true),
});

// Maintenance Request Update Schema
export const maintenanceRequestUpdateSchema = maintenanceRequestSchema
  .partial()
  .omit({
    roomId: true,
    reportedBy: true,
  });

// Maintenance Request Search Schema
export const maintenanceRequestSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: maintenanceStatusSchema.optional(),
  priority: maintenancePrioritySchema.optional(),
  maintenanceType: maintenanceTypeSchema.optional(),
  assignedTo: z.string().optional(),
  roomId: z.string().optional(),
  reportedBy: z.string().optional(),
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
    .enum(['priority', 'scheduledDate', 'createdAt', 'status'])
    .default('priority'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Maintenance Request Filter Schema
export const maintenanceRequestFilterSchema = z.object({
  status: maintenanceStatusSchema.optional(),
  priority: maintenancePrioritySchema.optional(),
  maintenanceType: maintenanceTypeSchema.optional(),
  assignedTo: z.string().optional(),
  roomId: z.string().optional(),
  reportedBy: z.string().optional(),
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
    .enum(['priority', 'scheduledDate', 'createdAt', 'status'])
    .default('priority'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Maintenance Assignment Schema
export const maintenanceAssignmentSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  assignedTo: z.string().min(1, 'Assigned staff ID is required'),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Maintenance Status Update Schema
export const maintenanceStatusUpdateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  status: maintenanceStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Maintenance Completion Schema
export const maintenanceCompletionSchema = z.object({
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
export const maintenanceValidationSchemas = {
  maintenanceRequest: maintenanceRequestSchema,
  maintenanceRequestUpdate: maintenanceRequestUpdateSchema,
  maintenanceRequestSearch: maintenanceRequestSearchSchema,
  maintenanceRequestFilter: maintenanceRequestFilterSchema,
  maintenanceAssignment: maintenanceAssignmentSchema,
  maintenanceStatusUpdate: maintenanceStatusUpdateSchema,
  maintenanceCompletion: maintenanceCompletionSchema,
};
