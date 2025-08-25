import { z } from 'zod';

// Notification Type Enum
export const notificationTypeSchema = z.enum([
  'reservation',
  'check_in',
  'check_out',
  'maintenance',
  'housekeeping',
  'billing',
  'feedback',
  'service_request',
  'system',
  'other',
]);

// Notification Priority Enum
export const notificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

// Notification Status Enum
export const notificationStatusSchema = z.enum([
  'unread',
  'read',
  'archived',
  'deleted',
]);

// Base Notification Schema
export const notificationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  type: notificationTypeSchema,
  priority: notificationPrioritySchema.default('medium'),
  status: notificationStatusSchema.default('unread'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message cannot exceed 1000 characters'),
  data: z.record(z.string(), z.any()).optional(),
  readAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Notification Update Schema
export const notificationUpdateSchema = notificationSchema.partial().omit({
  recipientId: true,
});

// Notification Search Schema
export const notificationSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  status: notificationStatusSchema.optional(),
  recipientId: z.string().optional(),
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
    .enum(['createdAt', 'priority', 'status', 'type'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Notification Filter Schema
export const notificationFilterSchema = z.object({
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  status: notificationStatusSchema.optional(),
  recipientId: z.string().optional(),
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
    .enum(['createdAt', 'priority', 'status', 'type'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Notification Status Update Schema
export const notificationStatusUpdateSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
  status: notificationStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Notification Mark as Read Schema
export const notificationMarkAsReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
  readAt: z.date().default(() => new Date()),
});

// Bulk Notification Status Update Schema
export const bulkNotificationStatusUpdateSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, 'Notification ID is required'))
    .min(1, 'At least one notification ID is required')
    .max(100, 'Cannot update more than 100 notifications at once'),
  status: notificationStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const notificationValidationSchemas = {
  notification: notificationSchema,
  notificationUpdate: notificationUpdateSchema,
  notificationSearch: notificationSearchSchema,
  notificationFilter: notificationFilterSchema,
  notificationStatusUpdate: notificationStatusUpdateSchema,
  notificationMarkAsRead: notificationMarkAsReadSchema,
  bulkNotificationStatusUpdate: bulkNotificationStatusUpdateSchema,
};
