import { z } from 'zod';

// Bill Status Enum
export const billStatusSchema = z.enum([
  'draft',
  'pending',
  'paid',
  'overdue',
  'cancelled',
  'refunded',
]);

// Payment Method Enum
export const paymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'bank_transfer',
  'digital_wallet',
  'check',
]);

// Base Bill Schema
export const billSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  guestId: z.string().min(1, 'Guest ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  checkInId: z.string().min(1, 'Check-in ID is required'),
  checkOutId: z.string().optional(),
  baseAmount: z
    .number()
    .min(0, 'Base amount cannot be negative')
    .max(100000, 'Base amount cannot exceed 100000'),
  taxAmount: z
    .number()
    .min(0, 'Tax amount cannot be negative')
    .max(10000, 'Tax amount cannot exceed 10000'),
  discountAmount: z
    .number()
    .min(0, 'Discount amount cannot be negative')
    .max(10000, 'Discount amount cannot exceed 10000'),
  totalAmount: z
    .number()
    .min(0, 'Total amount cannot be negative')
    .max(100000, 'Total amount cannot exceed 100000'),
  status: billStatusSchema.default('draft'),
  paymentMethod: paymentMethodSchema.optional(),
  paymentDate: z.date().optional(),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
});

// Bill Update Schema
export const billUpdateSchema = billSchema.partial().omit({
  reservationId: true,
  guestId: true,
  roomId: true,
  checkInId: true,
});

// Bill Search Schema
export const billSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  status: billStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount cannot be negative').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['totalAmount', 'dueDate', 'createdAt', 'status'])
    .default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Bill Filter Schema
export const billFilterSchema = z.object({
  status: billStatusSchema.optional(),
  guestId: z.string().optional(),
  roomId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount cannot be negative').optional(),
  paymentMethod: paymentMethodSchema.optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['totalAmount', 'dueDate', 'createdAt', 'status'])
    .default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Bill Payment Schema
export const billPaymentSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  paymentMethod: paymentMethodSchema,
  paymentAmount: z
    .number()
    .min(0.01, 'Payment amount must be greater than 0')
    .max(100000, 'Payment amount cannot exceed 100000'),
  paymentDate: z.date().min(new Date(), 'Payment date must be in the future'),
  transactionId: z
    .string()
    .max(100, 'Transaction ID cannot exceed 100 characters')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Bill Refund Schema
export const billRefundSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  refundAmount: z
    .number()
    .min(0.01, 'Refund amount must be greater than 0')
    .max(100000, 'Refund amount cannot exceed 100000'),
  refundReason: z
    .string()
    .min(1, 'Refund reason is required')
    .max(500, 'Refund reason cannot exceed 500 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Export all schemas
export const billValidationSchemas = {
  bill: billSchema,
  billUpdate: billUpdateSchema,
  billSearch: billSearchSchema,
  billFilter: billFilterSchema,
  billPayment: billPaymentSchema,
  billRefund: billRefundSchema,
};
