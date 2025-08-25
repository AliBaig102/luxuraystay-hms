import { z } from 'zod';

// Common ObjectId Schema
export const objectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Common Email Schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email')
  .max(100, 'Email cannot exceed 100 characters');

// Common Password Schema
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

// Common Phone Schema
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .max(20, 'Phone number cannot exceed 20 characters');

// Common URL Schema
export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .max(500, 'URL cannot exceed 500 characters');

// Common Date Schema
export const dateSchema = z
  .date()
  .min(new Date('1900-01-01'), 'Date cannot be before 1900')
  .max(new Date('2100-12-31'), 'Date cannot be after 2100');

// Common Date Range Schema
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(data => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

// Common Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
});

// Common Search Schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query cannot exceed 100 characters'),
  ...paginationSchema.shape,
});

// Common Sort Schema
export const sortSchema = z.object({
  sortBy: z
    .string()
    .min(1, 'Sort field is required')
    .max(50, 'Sort field cannot exceed 50 characters'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Common Filter Schema
export const filterSchema = z.object({
  ...paginationSchema.shape,
  ...sortSchema.shape,
  isActive: z.boolean().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

// Common File Upload Schema
export const fileUploadSchema = z.object({
  fieldname: z.string().min(1, 'Field name is required'),
  originalname: z.string().min(1, 'Original name is required'),
  encoding: z.string().min(1, 'Encoding is required'),
  mimetype: z.string().min(1, 'MIME type is required'),
  size: z
    .number()
    .min(0, 'File size cannot be negative')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

// Common Address Schema
export const addressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street is required')
    .max(200, 'Street cannot exceed 200 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State cannot exceed 100 characters'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .max(20, 'ZIP code cannot exceed 20 characters'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country cannot exceed 100 characters'),
});

// Common Contact Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship cannot exceed 50 characters'),
});

// Common Status Update Schema
export const statusUpdateSchema = z.object({
  status: z
    .string()
    .min(1, 'Status is required')
    .max(50, 'Status cannot exceed 50 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Common Bulk Operation Schema
export const bulkOperationSchema = z.object({
  ids: z
    .array(objectIdSchema)
    .min(1, 'At least one ID is required')
    .max(100, 'Cannot process more than 100 items at once'),
  operation: z.enum(['delete', 'update', 'activate', 'deactivate']),
  data: z.record(z.string(), z.any()).optional(),
});

// Common Export Schema
export const exportSchema = z.object({
  format: z.enum(['json', 'csv', 'excel', 'pdf']).default('json'),
  filters: z.record(z.string(), z.any()).optional(),
  fields: z.array(z.string()).optional(),
  includeInactive: z.boolean().default(false),
});

// Common Import Schema
export const importSchema = z.object({
  file: fileUploadSchema,
  overwrite: z.boolean().default(false),
  backup: z.boolean().default(true),
  validateOnly: z.boolean().default(false),
});

// Export all schemas
export const commonValidationSchemas = {
  objectId: objectIdSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  url: urlSchema,
  date: dateSchema,
  dateRange: dateRangeSchema,
  pagination: paginationSchema,
  search: searchSchema,
  sort: sortSchema,
  filter: filterSchema,
  fileUpload: fileUploadSchema,
  address: addressSchema,
  contact: contactSchema,
  statusUpdate: statusUpdateSchema,
  bulkOperation: bulkOperationSchema,
  export: exportSchema,
  import: importSchema,
};
