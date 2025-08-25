import { z } from 'zod';
import { commonSchemas } from '../middleware/';

// Room Type Enum
export const roomTypeSchema = z.enum([
  'standard',
  'deluxe',
  'suite',
  'presidential',
]);

// Room Status Enum
export const roomStatusSchema = z.enum([
  'available',
  'occupied',
  'cleaning',
  'maintenance',
  'reserved',
  'out_of_service',
]);

// Base Room Schema
export const roomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .max(10, 'Room number cannot exceed 10 characters'),
  roomType: roomTypeSchema,
  floor: z
    .number()
    .int()
    .min(1, 'Floor must be at least 1')
    .max(100, 'Floor cannot exceed 100'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .max(10, 'Capacity cannot exceed 10'),
  pricePerNight: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price cannot exceed 10000'),
  status: roomStatusSchema.default('available'),
  amenities: z
    .array(z.string())
    .max(50, 'Cannot have more than 50 amenities')
    .default([]),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  images: z
    .array(z.string().url('Please enter valid URLs'))
    .max(20, 'Cannot have more than 20 images')
    .optional(),
  isActive: z.boolean().default(true),
});

// Room Update Schema
export const roomUpdateSchema = roomSchema.partial();

// Room Search Schema
export const roomSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  roomType: roomTypeSchema.optional(),
  status: roomStatusSchema.optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  floor: z.number().int().min(1, 'Floor must be at least 1').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['roomNumber', 'pricePerNight', 'floor', 'capacity', 'createdAt'])
    .default('roomNumber'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Room Filter Schema
export const roomFilterSchema = z.object({
  roomType: roomTypeSchema.optional(),
  status: roomStatusSchema.optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  floor: z.number().int().min(1, 'Floor must be at least 1').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  amenities: z.array(z.string()).optional(),
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
    .enum(['roomNumber', 'pricePerNight', 'floor', 'capacity', 'createdAt'])
    .default('roomNumber'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Room Availability Schema
export const roomAvailabilitySchema = z.object({
  checkInDate: z.date().min(new Date(), 'Check-in date must be in the future'),
  checkOutDate: z
    .date()
    .min(new Date(), 'Check-out date must be in the future'),
  roomType: roomTypeSchema.optional(),
  minCapacity: z
    .number()
    .int()
    .min(1, 'Minimum capacity must be at least 1')
    .optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  amenities: z.array(z.string()).optional(),
});

// Room Status Update Schema
export const roomStatusUpdateSchema = z.object({
  status: roomStatusSchema,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Room Price Update Schema
export const roomPriceUpdateSchema = z.object({
  pricePerNight: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price cannot exceed 10000'),
  reason: z.string().max(200, 'Reason cannot exceed 200 characters').optional(),
});

// Room Maintenance Schema
export const roomMaintenanceSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  estimatedDuration: z
    .number()
    .int()
    .min(1, 'Estimated duration must be at least 1 hour')
    .max(720, 'Estimated duration cannot exceed 720 hours (30 days)'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

// Schema for getting a single room by ID
export const getRoomByIdSchema = z.object({
  params: z.object({
    id: commonSchemas.objectId,
  }),
});

// Schema for deleting a room
export const deleteRoomSchema = z.object({
  params: z.object({
    id: commonSchemas.objectId,
  }),
});

// Schema for creating a room
export const createRoomSchema = z.object({
  body: roomSchema,
});

// Schema for updating a room
export const updateRoomSchema = z.object({
  params: z.object({
    id: commonSchemas.objectId,
  }),
  body: roomUpdateSchema,
});

// Schema for getting all rooms with query parameters
export const getAllRoomsSchema = z.object({
  query: z.object({
    page: z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    search: z.string().optional(),
    sortBy: z
      .enum(['roomNumber', 'pricePerNight', 'floor', 'capacity', 'createdAt'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    roomType: roomTypeSchema.optional(),
    status: roomStatusSchema.optional(),
    floor: z.number().int().min(1, 'Floor must be at least 1').optional(),
    minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
    maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
    isActive: z.boolean().optional(),
  }),
});

// Export all schemas
export const roomValidationSchemas = {
  room: roomSchema,
  roomUpdate: roomUpdateSchema,
  roomSearch: roomSearchSchema,
  roomFilter: roomFilterSchema,
  roomAvailability: roomAvailabilitySchema,
  roomStatusUpdate: roomStatusUpdateSchema,
  roomPriceUpdate: roomPriceUpdateSchema,
  roomMaintenance: roomMaintenanceSchema,
};
