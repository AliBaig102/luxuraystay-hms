import { z } from 'zod';

// Rating Enum
export const ratingSchema = z.enum(['1', '2', '3', '4', '5']);

// Feedback Category Enum
export const feedbackCategorySchema = z.enum([
  'service',
  'cleanliness',
  'facility',
  'staff',
  'food',
  'value',
  'overall',
  'other',
]);

// Feedback Status Enum
export const feedbackStatusSchema = z.enum([
  'pending',
  'reviewed',
  'resolved',
  'closed',
]);

// Base Feedback Schema
export const feedbackSchema = z.object({
  guestId: z.string().min(1, 'Guest ID is required'),
  reservationId: z.string().min(1, 'Reservation ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  rating: ratingSchema,
  category: feedbackCategorySchema,
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  status: feedbackStatusSchema.default('pending'),
  isAnonymous: z.boolean().default(false),
  response: z
    .string()
    .max(1000, 'Response cannot exceed 1000 characters')
    .optional(),
  responseBy: z.string().optional(),
  responseDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Feedback Update Schema
export const feedbackUpdateSchema = feedbackSchema.partial().omit({
  guestId: true,
  reservationId: true,
  roomId: true,
});

// Feedback Search Schema
export const feedbackSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  rating: ratingSchema.optional(),
  category: feedbackCategorySchema.optional(),
  status: feedbackStatusSchema.optional(),
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
    .enum(['rating', 'createdAt', 'status', 'category'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Feedback Filter Schema
export const feedbackFilterSchema = z.object({
  rating: ratingSchema.optional(),
  category: feedbackCategorySchema.optional(),
  status: feedbackStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isAnonymous: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['rating', 'createdAt', 'status', 'category'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Feedback Response Schema
export const feedbackResponseSchema = z.object({
  feedbackId: z.string().min(1, 'Feedback ID is required'),
  response: z
    .string()
    .min(1, 'Response is required')
    .max(1000, 'Response cannot exceed 1000 characters'),
  responseBy: z.string().min(1, 'Responder ID is required'),
});

// Feedback Status Update Schema
export const feedbackStatusUpdateSchema = z.object({
  feedbackId: z.string().min(1, 'Feedback ID is required'),
  status: feedbackStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const feedbackValidationSchemas = {
  feedback: feedbackSchema,
  feedbackUpdate: feedbackUpdateSchema,
  feedbackSearch: feedbackSearchSchema,
  feedbackFilter: feedbackFilterSchema,
  feedbackResponse: feedbackResponseSchema,
  feedbackStatusUpdate: feedbackStatusUpdateSchema,
};
