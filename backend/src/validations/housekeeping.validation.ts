import { z } from 'zod';

// Task Status Enum
export const taskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'overdue',
]);

// Task Priority Enum
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Task Type Enum
export const taskTypeSchema = z.enum([
  'cleaning',
  'maintenance',
  'inspection',
  'restocking',
  'deep_cleaning',
]);

// Base Housekeeping Task Schema
export const housekeepingTaskSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  assignedTo: z.string().min(1, 'Assigned staff ID is required'),
  taskType: taskTypeSchema,
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('pending'),
  scheduledDate: z
    .date()
    .min(new Date(), 'Scheduled date must be in the future'),
  estimatedDuration: z
    .number()
    .int()
    .min(15, 'Estimated duration must be at least 15 minutes')
    .max(480, 'Estimated duration cannot exceed 480 minutes (8 hours)'),
  actualStartTime: z.date().optional(),
  actualEndTime: z.date().optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Housekeeping Task Update Schema
export const housekeepingTaskUpdateSchema = housekeepingTaskSchema
  .partial()
  .omit({
    roomId: true,
  });

// Housekeeping Task Search Schema
export const housekeepingTaskSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  taskType: taskTypeSchema.optional(),
  assignedTo: z.string().optional(),
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
    .enum(['scheduledDate', 'priority', 'status', 'createdAt'])
    .default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Housekeeping Task Filter Schema
export const housekeepingTaskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  taskType: taskTypeSchema.optional(),
  assignedTo: z.string().optional(),
  roomId: z.string().optional(),
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
    .enum(['scheduledDate', 'priority', 'status', 'createdAt'])
    .default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Task Assignment Schema
export const taskAssignmentSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  assignedTo: z.string().min(1, 'Assigned staff ID is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Task Status Update Schema
export const taskStatusUpdateSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  status: taskStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Task Completion Schema
export const taskCompletionSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  actualEndTime: z
    .date()
    .min(new Date(), 'Actual end time must be in the future'),
  completionNotes: z
    .string()
    .max(500, 'Completion notes cannot exceed 500 characters')
    .optional(),
});

// Export all schemas
export const housekeepingValidationSchemas = {
  housekeepingTask: housekeepingTaskSchema,
  housekeepingTaskUpdate: housekeepingTaskUpdateSchema,
  housekeepingTaskSearch: housekeepingTaskSearchSchema,
  housekeepingTaskFilter: housekeepingTaskFilterSchema,
  taskAssignment: taskAssignmentSchema,
  taskStatusUpdate: taskStatusUpdateSchema,
  taskCompletion: taskCompletionSchema,
};
