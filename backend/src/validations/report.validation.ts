import { z } from 'zod';
import { ReportType, ReportFormat } from '../types/models';

// Base report schema
const reportBaseSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  format: z.nativeEnum(ReportFormat),
  parameters: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Report creation schema
const reportCreateSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  format: z.nativeEnum(ReportFormat).default(ReportFormat.JSON),
  parameters: z.record(z.string(), z.any()).default({}),
  expiresAt: z.string().datetime().optional(),
});

// Report update schema
const reportUpdateSchema = z.object({
  reportType: z.nativeEnum(ReportType).optional(),
  format: z.nativeEnum(ReportFormat).optional(),
  parameters: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Report filter schema
const reportFilterSchema = z.object({
  reportType: z.nativeEnum(ReportType).optional(),
  format: z.nativeEnum(ReportFormat).optional(),
  generatedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['new', 'recent', 'old', 'expired']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z
    .enum(['generatedDate', 'reportType', 'format', 'createdAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Report generation parameters schemas
const occupancyReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  roomType: z.string().optional(),
  includeProjections: z.boolean().default(false),
});

const revenueReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  breakdown: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  includeServices: z.boolean().default(true),
  currency: z.string().default('USD'),
});

const feedbackReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  category: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  includeComments: z.boolean().default(true),
});

const maintenanceReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z
    .enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  includeCosting: z.boolean().default(true),
});

const housekeepingReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  taskType: z.string().optional(),
  staffId: z.string().optional(),
  roomType: z.string().optional(),
  includePerformanceMetrics: z.boolean().default(true),
});

const staffPerformanceReportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  staffId: z.string().optional(),
  department: z.string().optional(),
  includeRatings: z.boolean().default(true),
  includeTaskCompletion: z.boolean().default(true),
});

// Report generation schema with dynamic parameters
const reportGenerationSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  format: z.nativeEnum(ReportFormat).default(ReportFormat.JSON),
  parameters: z.union([
    occupancyReportParamsSchema,
    revenueReportParamsSchema,
    feedbackReportParamsSchema,
    maintenanceReportParamsSchema,
    housekeepingReportParamsSchema,
    staffPerformanceReportParamsSchema,
    z.record(z.string(), z.any()),
  ]),
  expiresAt: z.string().datetime().optional(),
  schedule: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      time: z.string().optional(),
      recipients: z.array(z.string().email()).optional(),
    })
    .optional(),
});

// Bulk operations schema
const bulkDeleteSchema = z.object({
  reportIds: z.array(z.string()).min(1, 'At least one report ID is required'),
});

const bulkUpdateSchema = z.object({
  reportIds: z.array(z.string()).min(1, 'At least one report ID is required'),
  updates: reportUpdateSchema,
});

// Report download schema
const reportDownloadSchema = z.object({
  format: z.nativeEnum(ReportFormat).optional(),
  includeMetadata: z.boolean().default(false),
});

// Report statistics schema
const reportStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['type', 'format', 'user', 'date']).optional(),
});

// Report cleanup schema
const reportCleanupSchema = z.object({
  olderThan: z.string().datetime().optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  format: z.nativeEnum(ReportFormat).optional(),
  dryRun: z.boolean().default(true),
});

// Export validation schemas
export const reportValidationSchemas = {
  // Basic CRUD
  report: reportBaseSchema,
  reportCreate: reportCreateSchema,
  reportUpdate: reportUpdateSchema,
  reportFilter: reportFilterSchema,

  // Report generation
  reportGeneration: reportGenerationSchema,
  occupancyParams: occupancyReportParamsSchema,
  revenueParams: revenueReportParamsSchema,
  feedbackParams: feedbackReportParamsSchema,
  maintenanceParams: maintenanceReportParamsSchema,
  housekeepingParams: housekeepingReportParamsSchema,
  staffPerformanceParams: staffPerformanceReportParamsSchema,

  // Operations
  bulkDelete: bulkDeleteSchema,
  bulkUpdate: bulkUpdateSchema,
  reportDownload: reportDownloadSchema,
  reportStats: reportStatsSchema,
  reportCleanup: reportCleanupSchema,
};

// Type exports for TypeScript
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
export type ReportGenerationInput = z.infer<typeof reportGenerationSchema>;
export type OccupancyReportParams = z.infer<typeof occupancyReportParamsSchema>;
export type RevenueReportParams = z.infer<typeof revenueReportParamsSchema>;
export type FeedbackReportParams = z.infer<typeof feedbackReportParamsSchema>;
export type MaintenanceReportParams = z.infer<
  typeof maintenanceReportParamsSchema
>;
export type HousekeepingReportParams = z.infer<
  typeof housekeepingReportParamsSchema
>;
export type StaffPerformanceReportParams = z.infer<
  typeof staffPerformanceReportParamsSchema
>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type ReportDownloadInput = z.infer<typeof reportDownloadSchema>;
export type ReportStatsInput = z.infer<typeof reportStatsSchema>;
export type ReportCleanupInput = z.infer<typeof reportCleanupSchema>;
