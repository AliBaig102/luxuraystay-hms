import { z } from 'zod';

// Inventory Item Type Enum
export const inventoryItemTypeSchema = z.enum([
  'amenities',
  'cleaning_supplies',
  'maintenance_tools',
  'office_supplies',
  'food_beverage',
  'linens',
  'electronics',
  'furniture',
  'decorations',
  'other',
]);

// Inventory Item Status Enum
export const inventoryItemStatusSchema = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'discontinued',
  'on_order',
  'reserved',
]);

// Inventory Unit Enum
export const inventoryUnitSchema = z.enum([
  'piece',
  'box',
  'pack',
  'bottle',
  'roll',
  'meter',
  'liter',
  'kilogram',
  'pair',
  'set',
  'other',
]);

// Base Inventory Item Schema
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(200, 'Item name cannot exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  type: inventoryItemTypeSchema,
  status: inventoryItemStatusSchema.default('in_stock'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(100, 'SKU cannot exceed 100 characters')
    .regex(
      /^[A-Z0-9-_]+$/,
      'SKU can only contain uppercase letters, numbers, hyphens, and underscores'
    ),
  barcode: z
    .string()
    .max(100, 'Barcode cannot exceed 100 characters')
    .optional(),
  unit: inventoryUnitSchema.default('piece'),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity cannot be negative')
    .max(1000000, 'Quantity cannot exceed 1000000'),
  minQuantity: z
    .number()
    .int()
    .min(0, 'Minimum quantity cannot be negative')
    .max(100000, 'Minimum quantity cannot exceed 100000')
    .default(0),
  maxQuantity: z
    .number()
    .int()
    .min(0, 'Maximum quantity cannot be negative')
    .max(1000000, 'Maximum quantity cannot exceed 1000000')
    .optional(),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .max(100000, 'Unit price cannot exceed 100000'),
  totalValue: z
    .number()
    .min(0, 'Total value cannot be negative')
    .max(100000000, 'Total value cannot exceed 100000000')
    .optional(), // totalValue will be calculated automatically
  supplier: z
    .string()
    .max(200, 'Supplier cannot exceed 200 characters')
    .optional(),
  location: z
    .string()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
  category: z
    .string()
    .max(100, 'Category cannot exceed 100 characters')
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag cannot exceed 50 characters'))
    .max(20, 'Cannot have more than 20 tags')
    .default([]),
  expiryDate: z.date().optional(),
  lastRestocked: z.date().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  isActive: z.boolean().default(true),
});

// Inventory Item Update Schema
export const inventoryItemUpdateSchema = inventoryItemSchema.partial().omit({
  sku: true,
  totalValue: true, // totalValue will be calculated automatically
});

// Inventory Item Search Schema
export const inventoryItemSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  type: inventoryItemTypeSchema.optional(),
  status: inventoryItemStatusSchema.optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  minQuantity: z
    .number()
    .int()
    .min(0, 'Minimum quantity cannot be negative')
    .optional(),
  maxQuantity: z
    .number()
    .int()
    .min(0, 'Maximum quantity cannot be negative')
    .optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum([
      'name',
      'quantity',
      'unitPrice',
      'totalValue',
      'lastRestocked',
      'createdAt',
    ])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Inventory Item Filter Schema
export const inventoryItemFilterSchema = z.object({
  type: inventoryItemTypeSchema.optional(),
  status: inventoryItemStatusSchema.optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  minQuantity: z
    .number()
    .int()
    .min(0, 'Minimum quantity cannot be negative')
    .optional(),
  maxQuantity: z
    .number()
    .int()
    .min(0, 'Maximum quantity cannot be negative')
    .optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z
    .enum([
      'name',
      'quantity',
      'unitPrice',
      'totalValue',
      'lastRestocked',
      'createdAt',
    ])
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Inventory Transaction Schema
export const inventoryTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  transactionType: z.enum([
    'in',
    'out',
    'adjustment',
    'transfer',
    'return',
    'damage',
    'expiry',
  ]),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity cannot exceed 100000'),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .max(100000, 'Unit price cannot exceed 100000')
    .optional(),
  totalValue: z
    .number()
    .min(0, 'Total value cannot be negative')
    .max(10000000, 'Total value cannot exceed 10000000')
    .optional(),
  reference: z
    .string()
    .max(200, 'Reference cannot exceed 200 characters')
    .optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  performedBy: z.string().min(1, 'Performer ID is required'),
  location: z
    .string()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
});

// Inventory Restock Schema
export const inventoryRestockSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity cannot exceed 100000'),
  unitPrice: z
    .number()
    .min(0, 'Unit price cannot be negative')
    .max(100000, 'Unit price cannot exceed 100000'),
  supplier: z
    .string()
    .max(200, 'Supplier cannot exceed 200 characters')
    .optional(),
  orderNumber: z
    .string()
    .max(100, 'Order number cannot exceed 100 characters')
    .optional(),
  expectedDelivery: z
    .date()
    .min(new Date(), 'Expected delivery must be in the future')
    .optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Inventory Transfer Schema
export const inventoryTransferSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity cannot exceed 100000'),
  fromLocation: z
    .string()
    .min(1, 'Source location is required')
    .max(200, 'Source location cannot exceed 200 characters'),
  toLocation: z
    .string()
    .min(1, 'Destination location is required')
    .max(200, 'Destination location cannot exceed 200 characters'),
  reason: z
    .string()
    .min(1, 'Transfer reason is required')
    .max(500, 'Transfer reason cannot exceed 500 characters'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Inventory Adjustment Schema
export const inventoryAdjustmentSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  adjustmentType: z.enum(['add', 'subtract', 'set']),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity cannot be negative')
    .max(100000, 'Quantity cannot exceed 100000'),
  reason: z
    .string()
    .min(1, 'Adjustment reason is required')
    .max(500, 'Adjustment reason cannot exceed 500 characters'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Export all schemas
export const inventoryValidationSchemas = {
  inventoryItem: inventoryItemSchema,
  inventoryItemUpdate: inventoryItemUpdateSchema,
  inventoryItemSearch: inventoryItemSearchSchema,
  inventoryItemFilter: inventoryItemFilterSchema,
  inventoryTransaction: inventoryTransactionSchema,
  inventoryRestock: inventoryRestockSchema,
  inventoryTransfer: inventoryTransferSchema,
  inventoryAdjustment: inventoryAdjustmentSchema,
};
