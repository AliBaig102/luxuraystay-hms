import { z } from 'zod';

// Notification Type Enum
export const notificationTypeSchema = z.enum([
  'booking',
  'maintenance',
  'housekeeping',
  'billing',
  'system',
  'reminder',
]);

// Priority Enum
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Recipient Type Enum
export const recipientTypeSchema = z.enum(['user', 'guest']);

// Base Notification Schema
export const notificationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  recipientType: recipientTypeSchema,
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message cannot exceed 1000 characters'),
  type: notificationTypeSchema,
  priority: prioritySchema.default('medium'),
  actionUrl: z.string().url('Action URL must be a valid URL').optional(),
  isRead: z.boolean().default(false),
  readDate: z.date().optional(),
});

// Notification Update Schema
export const notificationUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional(),
  type: notificationTypeSchema.optional(),
  priority: prioritySchema.optional(),
  actionUrl: z.string().url('Action URL must be a valid URL').optional(),
  isRead: z.boolean().optional(),
});

// Notification Filter Schema
export const notificationFilterSchema = z.object({
  recipientId: z.string().optional(),
  recipientType: recipientTypeSchema.optional(),
  type: notificationTypeSchema.optional(),
  priority: prioritySchema.optional(),
  isRead: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['createdAt', 'priority', 'type', 'isRead'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Notification Search Schema
export const notificationSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  type: notificationTypeSchema.optional(),
  priority: prioritySchema.optional(),
  recipientId: z.string().optional(),
  isRead: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['createdAt', 'priority', 'type', 'relevance'])
    .default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Mark as Read Schema
export const markAsReadSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, 'Notification ID is required'))
    .min(1, 'At least one notification ID is required'),
  isRead: z.boolean().default(true),
});

// Bulk Delete Schema
export const bulkDeleteSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, 'Notification ID is required'))
    .min(1, 'At least one notification ID is required'),
});

// Notification Statistics Filter Schema
export const notificationStatsFilterSchema = z.object({
  recipientId: z.string().optional(),
  recipientType: recipientTypeSchema.optional(),
  type: notificationTypeSchema.optional(),
  priority: prioritySchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Export all schemas
export const notificationValidationSchemas = {
  notificationType: notificationTypeSchema,
  priority: prioritySchema,
  recipientType: recipientTypeSchema,
  notification: notificationSchema,
  notificationUpdate: notificationUpdateSchema,
  notificationFilter: notificationFilterSchema,
  notificationSearch: notificationSearchSchema,
  markAsRead: markAsReadSchema,
  bulkDelete: bulkDeleteSchema,
  notificationStatsFilter: notificationStatsFilterSchema,
};
