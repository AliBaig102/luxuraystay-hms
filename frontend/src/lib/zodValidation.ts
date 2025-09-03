import { USER_ROLES, ROOM_TYPES, ROOM_STATUSES, BILL_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, FEEDBACK_CATEGORIES } from "@/types/models";
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

// Bill validation schemas
export const billCreateSchema = z.object({
  reservationId: z.string().min(1, 'Reservation is required'),
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  checkInId: z.string().min(1, 'Check-in ID is required'),
  checkOutId: z.string().optional(),
  baseAmount: z.number().min(0, 'Base amount cannot be negative').max(100000, 'Base amount cannot exceed $100,000'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').max(10000, 'Tax amount cannot exceed $10,000'),
  discountAmount: z.number().min(0, 'Discount amount cannot be negative').max(10000, 'Discount amount cannot exceed $10,000').optional(),
  serviceCharges: z.number().min(0, 'Service charges cannot be negative').optional(),
  totalAmount: z.number().min(0, 'Total amount cannot be negative').max(100000, 'Total amount cannot exceed $100,000'),
  status: z.enum([
    BILL_STATUSES.DRAFT,
    BILL_STATUSES.PENDING,
    BILL_STATUSES.PAID,
    BILL_STATUSES.OVERDUE,
    BILL_STATUSES.CANCELLED,
    BILL_STATUSES.REFUNDED,
  ] as const).default(BILL_STATUSES.DRAFT),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.DIGITAL_WALLET,
  ] as const).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

export const billUpdateSchema = billCreateSchema.partial().omit({
  reservationId: true,
  guestId: true,
  roomId: true,
  checkInId: true,
});

export const billSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum([
    BILL_STATUSES.DRAFT,
    BILL_STATUSES.PENDING,
    BILL_STATUSES.PAID,
    BILL_STATUSES.OVERDUE,
    BILL_STATUSES.CANCELLED,
    BILL_STATUSES.REFUNDED,
  ] as const).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  reservationId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount cannot be negative').optional(),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.DIGITAL_WALLET,
  ] as const).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['totalAmount', 'dueDate', 'createdAt', 'status']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const billFilterSchema = z.object({
  status: z.enum([
    BILL_STATUSES.DRAFT,
    BILL_STATUSES.PENDING,
    BILL_STATUSES.PAID,
    BILL_STATUSES.OVERDUE,
    BILL_STATUSES.CANCELLED,
    BILL_STATUSES.REFUNDED,
  ] as const).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  reservationId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount cannot be negative').optional(),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.DIGITAL_WALLET,
  ] as const).optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['totalAmount', 'dueDate', 'createdAt', 'status']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const billPaymentSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.DIGITAL_WALLET,
  ] as const),
  paymentAmount: z.number().min(0.01, 'Payment amount must be greater than 0').max(100000, 'Payment amount cannot exceed $100,000'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  transactionId: z.string().max(100, 'Transaction ID cannot exceed 100 characters').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const billRefundSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  refundAmount: z.number().min(0.01, 'Refund amount must be greater than 0').max(100000, 'Refund amount cannot exceed $100,000'),
  refundReason: z.string().min(1, 'Refund reason is required').max(500, 'Refund reason cannot exceed 500 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Bill form data types
export type BillCreateFormData = z.infer<typeof billCreateSchema>;
export type BillUpdateFormData = z.infer<typeof billUpdateSchema>;
export type BillSearchFormData = z.infer<typeof billSearchSchema>;
export type BillFilterFormData = z.infer<typeof billFilterSchema>;
export type BillPaymentFormData = z.infer<typeof billPaymentSchema>;
export type BillRefundFormData = z.infer<typeof billRefundSchema>;

// Check-in validation schemas
export const checkInCreateSchema = z.object({
  reservationId: z.string().min(1, "Reservation is required"),
  roomId: z.string().min(1, "Room is required"),
  guestId: z.string().min(1, "Guest is required"),
  assignedRoomNumber: z.string().min(1, "Room number is required"),
  checkInTime: z.date({
    error: "Check-in time is required",
  }),
  keyIssued: z.boolean().default(false),
  welcomePackDelivered: z.boolean().default(false),
  specialInstructions: z.string().optional(),
});

export const checkInUpdateSchema = checkInCreateSchema.partial().omit({
  reservationId: true,
  guestId: true,
  roomId: true,
});

export const checkInSearchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z
    .enum(['checkInTime', 'expectedCheckOutTime', 'createdAt', 'status'])
    .default('checkInTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const checkInFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z
    .enum(['checkInTime', 'expectedCheckOutTime', 'createdAt', 'status'])
    .default('checkInTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const checkInCompletionSchema = z.object({
  checkInId: z.string().min(1, "Check-in ID is required"),
  actualCheckInTime: z
    .date()
    .min(new Date(), "Actual check-in time must be in the future"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Check-out validation schemas
export const checkOutCreateSchema = z.object({
  checkInId: z.string().min(1, "Check-in is required"),
  reservationId: z.string().min(1, "Reservation is required"),
  roomId: z.string().min(1, "Room is required"),
  guestId: z.string().min(1, "Guest is required"),
  checkOutTime: z.date({
    error: "Check-out time is required",
  }),
  finalBillAmount: z.number().min(0, "Final bill amount must be positive"),
  paymentStatus: z.enum([
    PAYMENT_STATUSES.PENDING,
    PAYMENT_STATUSES.PARTIAL,
    PAYMENT_STATUSES.PAID,
    PAYMENT_STATUSES.OVERDUE,
    PAYMENT_STATUSES.CANCELLED,
  ]),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const checkOutUpdateSchema = checkOutCreateSchema.partial().omit({
  checkInId: true,
  guestId: true,
  roomId: true,
});

export const checkOutSearchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z
    .enum(['expectedCheckOutTime', 'actualCheckOutTime', 'createdAt', 'status'])
    .default('expectedCheckOutTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const checkOutFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  lateCheckOut: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z
    .enum(['expectedCheckOutTime', 'actualCheckOutTime', 'createdAt', 'status'])
    .default('expectedCheckOutTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const checkOutCompletionSchema = z.object({
  checkOutId: z.string().min(1, "Check-out ID is required"),
  actualCheckOutTime: z
    .date()
    .min(new Date(), "Actual check-out time must be in the future"),
  lateCheckOutFee: z
    .number()
    .min(0, "Late check-out fee cannot be negative")
    .max(1000, "Late check-out fee cannot exceed 1000")
    .optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Check-in/Check-out form data types
export type CheckInCreateFormData = z.infer<typeof checkInCreateSchema>;
export type CheckInUpdateFormData = z.infer<typeof checkInUpdateSchema>;
export type CheckInSearchFormData = z.infer<typeof checkInSearchSchema>;
export type CheckInFilterFormData = z.infer<typeof checkInFilterSchema>;
export type CheckInCompletionFormData = z.infer<typeof checkInCompletionSchema>;

export type CheckOutCreateFormData = z.infer<typeof checkOutCreateSchema>;
export type CheckOutUpdateFormData = z.infer<typeof checkOutUpdateSchema>;
export type CheckOutSearchFormData = z.infer<typeof checkOutSearchSchema>;
export type CheckOutFilterFormData = z.infer<typeof checkOutFilterSchema>;
export type CheckOutCompletionFormData = z.infer<typeof checkOutCompletionSchema>;

// Feedback validation schemas
export const feedbackCreateSchema = z.object({
  guestId: z.string().min(1, "Guest is required"),
  reservationId: z.string().min(1, "Reservation is required"),
  roomId: z.string().min(1, "Room is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  category: z.enum([
    FEEDBACK_CATEGORIES.ROOM_QUALITY,
    FEEDBACK_CATEGORIES.SERVICE,
    FEEDBACK_CATEGORIES.CLEANLINESS,
    FEEDBACK_CATEGORIES.FOOD,
    FEEDBACK_CATEGORIES.STAFF,
    FEEDBACK_CATEGORIES.FACILITIES,
    FEEDBACK_CATEGORIES.VALUE,
    FEEDBACK_CATEGORIES.OVERALL,
  ] as const),
  comment: z.string().max(2000, "Comment cannot exceed 2000 characters").optional(),
  isAnonymous: z.boolean().default(false),
});

export const feedbackUpdateSchema = feedbackCreateSchema.partial().omit({
  guestId: true,
  reservationId: true,
  roomId: true,
});

export const feedbackSearchSchema = z.object({
  query: z.string().max(100, "Search query cannot exceed 100 characters").optional(),
  rating: z.number().min(1).max(5).optional(),
  category: z.enum([
    FEEDBACK_CATEGORIES.ROOM_QUALITY,
    FEEDBACK_CATEGORIES.SERVICE,
    FEEDBACK_CATEGORIES.CLEANLINESS,
    FEEDBACK_CATEGORIES.FOOD,
    FEEDBACK_CATEGORIES.STAFF,
    FEEDBACK_CATEGORIES.FACILITIES,
    FEEDBACK_CATEGORIES.VALUE,
    FEEDBACK_CATEGORIES.OVERALL,
  ] as const).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  sortBy: z.enum(['rating', 'createdAt', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const feedbackFilterSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  category: z.enum([
    FEEDBACK_CATEGORIES.ROOM_QUALITY,
    FEEDBACK_CATEGORIES.SERVICE,
    FEEDBACK_CATEGORIES.CLEANLINESS,
    FEEDBACK_CATEGORIES.FOOD,
    FEEDBACK_CATEGORIES.STAFF,
    FEEDBACK_CATEGORIES.FACILITIES,
    FEEDBACK_CATEGORIES.VALUE,
    FEEDBACK_CATEGORIES.OVERALL,
  ] as const).optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  reservationId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  hasResponse: z.boolean().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  sortBy: z.enum(['rating', 'createdAt', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const feedbackResponseSchema = z.object({
  feedbackId: z.string().min(1, "Feedback ID is required"),
  response: z.string().min(1, "Response is required").max(1000, "Response cannot exceed 1000 characters"),
  responseBy: z.string().min(1, "Responder ID is required"),
});

// Feedback form data types
export type FeedbackCreateFormData = z.infer<typeof feedbackCreateSchema>;
export type FeedbackUpdateFormData = z.infer<typeof feedbackUpdateSchema>;
export type FeedbackSearchFormData = z.infer<typeof feedbackSearchSchema>;
export type FeedbackFilterFormData = z.infer<typeof feedbackFilterSchema>;
export type FeedbackResponseFormData = z.infer<typeof feedbackResponseSchema>;

// Housekeeping Task validation schemas
export const housekeepingTaskCreateSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  assignedStaffId: z.string().min(1, "Assigned staff is required"),
  taskType: z.enum([
    "daily_cleaning", "deep_cleaning", "linen_change", 
    "amenity_restock", "inspection"
  ] as const),
  priority: z.enum(["low", "medium", "high", "urgent"] as const).default("medium"),
  status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"] as const).default("pending"),
  scheduledDate: z.date({
    error: "Scheduled date is required",
  }),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const housekeepingTaskUpdateSchema = housekeepingTaskCreateSchema.partial().omit({ roomId: true });

export const housekeepingTaskSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100, "Search query cannot exceed 100 characters"),
  status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"] as const).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"] as const).optional(),
  taskType: z.enum([
    "daily_cleaning", "deep_cleaning", "linen_change", 
    "amenity_restock", "inspection"
  ] as const).optional(),
  assignedTo: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  sortBy: z.enum(["scheduledDate", "priority", "status", "createdAt"] as const).default("scheduledDate"),
  sortOrder: z.enum(["asc", "desc"] as const).default("asc"),
});

export const housekeepingTaskFilterSchema = z.object({
  status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"] as const).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"] as const).optional(),
  taskType: z.enum([
    "daily_cleaning", "deep_cleaning", "linen_change", 
    "amenity_restock", "inspection"
  ] as const).optional(),
  assignedTo: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  sortBy: z.enum(["scheduledDate", "priority", "status", "createdAt"] as const).default("scheduledDate"),
  sortOrder: z.enum(["asc", "desc"] as const).default("asc"),
});

export const taskAssignmentSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  assignedTo: z.string().min(1, "Assigned staff ID is required"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const taskStatusUpdateSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"] as const),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const taskCompletionSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  actualEndTime: z.date({
    error: "Actual end time is required",
  }),
  completionNotes: z.string().max(500, "Completion notes cannot exceed 500 characters").optional(),
});

// Housekeeping Task form data types
export type HousekeepingTaskCreateFormData = z.infer<typeof housekeepingTaskCreateSchema>;
export type HousekeepingTaskUpdateFormData = z.infer<typeof housekeepingTaskUpdateSchema>;
export type HousekeepingTaskSearchFormData = z.infer<typeof housekeepingTaskSearchSchema>;
export type HousekeepingTaskFilterFormData = z.infer<typeof housekeepingTaskFilterSchema>;
export type TaskAssignmentFormData = z.infer<typeof taskAssignmentSchema>;
export type TaskStatusUpdateFormData = z.infer<typeof taskStatusUpdateSchema>;
export type TaskCompletionFormData = z.infer<typeof taskCompletionSchema>;
