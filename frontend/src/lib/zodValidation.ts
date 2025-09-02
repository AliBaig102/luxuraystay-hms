import { USER_ROLES, ROOM_TYPES, ROOM_STATUSES } from "@/types/models";
import z from "zod";

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Signup form validation schema
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number (eg: +1234567890)'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type definitions
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;


export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  phone: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  role: z.enum([
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.RECEPTIONIST,
    USER_ROLES.HOUSEKEEPING,
    USER_ROLES.MAINTENANCE,
    USER_ROLES.GUEST,
  ] as const),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  _id: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Room validation schemas
export const createRoomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, "Room number is required")
    .max(10, "Room number cannot exceed 10 characters"),
  roomType: z.enum([
    ROOM_TYPES.STANDARD,
    ROOM_TYPES.DELUXE,
    ROOM_TYPES.SUITE,
    ROOM_TYPES.PRESIDENTIAL,
  ] as const),
  floor: z
    .number()
    .int("Floor must be a whole number")
    .min(1, "Floor must be at least 1")
    .max(50, "Floor cannot exceed 50"),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(10, "Capacity cannot exceed 10 guests"),
  pricePerNight: z
    .number()
    .min(0, "Price must be a positive number")
    .max(10000, "Price cannot exceed $10,000 per night"),
  status: z.enum([
    ROOM_STATUSES.AVAILABLE,
    ROOM_STATUSES.OCCUPIED,
    ROOM_STATUSES.MAINTENANCE,
    ROOM_STATUSES.OUT_OF_SERVICE,
    ROOM_STATUSES.CLEANING,
    ROOM_STATUSES.RESERVED,
  ] as const),
  amenities: z
    .array(z.string())
    .optional()
    .default([]),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  images: z
    .array(z.string().url("Please enter valid image URLs"))
    .optional()
    .default([]),
  isActive: z.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial().extend({
  _id: z.string().optional(),
});

export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;

// Inventory validation schemas
export const inventoryItemCreateSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['food', 'beverage', 'cleaning_supply', 'amenity', 'maintenance', 'office_supply', 'other']),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'expired', 'discontinued']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  minQuantity: z.number().min(0, 'Minimum quantity cannot be negative'),
  maxQuantity: z.number().min(0, 'Maximum quantity cannot be negative').optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  barcode: z.string().optional(),
  expiryDate: z.string().optional(),
  lastRestocked: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const inventoryItemUpdateSchema = inventoryItemCreateSchema.partial().omit({ sku: true });

export type InventoryItemCreateFormData = z.infer<typeof inventoryItemCreateSchema>;
export type InventoryItemUpdateFormData = z.infer<typeof inventoryItemUpdateSchema>;

// Reservation validation schemas
export const reservationCreateSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  numberOfGuests: z.number().min(1, 'Number of guests must be at least 1'),
  totalAmount: z.number().min(0, 'Total amount cannot be negative'),
  depositAmount: z.number().min(0, 'Deposit amount cannot be negative').optional(),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'overdue', 'cancelled']).default('pending'),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['online', 'phone', 'walk_in', 'travel_agent']).default('online'),
  isActive: z.boolean().default(true),
});

export const reservationUpdateSchema = reservationCreateSchema.partial().omit({ guestId: true, roomId: true });

export const reservationSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  source: z.enum(['online', 'phone', 'walk_in', 'travel_agent']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const reservationAvailabilitySchema = z.object({
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  numberOfGuests: z.number().min(1, 'Number of guests must be at least 1'),
  roomType: z.enum(['standard', 'deluxe', 'suite', 'presidential']).optional(),
});

export const reservationStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']),
  notes: z.string().optional(),
});

export type ReservationCreateFormData = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateFormData = z.infer<typeof reservationUpdateSchema>;
export type ReservationSearchFormData = z.infer<typeof reservationSearchSchema>;
export type ReservationAvailabilityFormData = z.infer<typeof reservationAvailabilitySchema>;
export type ReservationStatusUpdateFormData = z.infer<typeof reservationStatusUpdateSchema>;
