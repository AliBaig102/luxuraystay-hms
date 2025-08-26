import { z } from 'zod';

// Rating Schema
export const ratingSchema = z.number().int().min(1).max(5);

// Feedback Category Enum
export const feedbackCategorySchema = z.enum([
  'room_quality',
  'service',
  'cleanliness',
  'food',
  'staff',
  'facilities',
  'value',
  'overall',
]);

// Base Feedback Schema
export const feedbackSchema = z.object({
  guestId: z.string().min(1, 'Guest ID is required'),
  reservationId: z.string().min(1, 'Reservation ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  rating: ratingSchema,
  category: feedbackCategorySchema,
  comment: z
    .string()
    .max(2000, 'Comment cannot exceed 2000 characters')
    .optional(),
  isAnonymous: z.boolean().default(false),
  response: z
    .string()
    .max(1000, 'Response cannot exceed 1000 characters')
    .optional(),
  respondedBy: z.string().optional(),
  responseDate: z.date().optional(),
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
  sortBy: z.enum(['rating', 'createdAt', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Feedback Filter Schema
export const feedbackFilterSchema = z.object({
  rating: ratingSchema.optional(),
  category: feedbackCategorySchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  reservationId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  hasResponse: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z.enum(['rating', 'createdAt', 'category']).default('createdAt'),
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

// Export all schemas
export const feedbackValidationSchemas = {
  rating: ratingSchema,
  feedbackCategory: feedbackCategorySchema,
  feedback: feedbackSchema,
  feedbackUpdate: feedbackUpdateSchema,
  feedbackSearch: feedbackSearchSchema,
  feedbackFilter: feedbackFilterSchema,
  feedbackResponse: feedbackResponseSchema,
};
