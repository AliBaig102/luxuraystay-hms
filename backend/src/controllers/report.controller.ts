import { Request, Response } from 'express';
import { ReportModel } from '../models/Report.model';
import { reportValidationSchemas } from '../validations/report.validation';
import { ResponseUtil } from '../utils/response';
import { Types } from 'mongoose';
import { ReportType, ReportFormat } from '../types/models';

// Import other models for report generation
import { RoomModel } from '../models/Room.model';
import { ReservationModel } from '../models/Reservation.model';
import { BillModel } from '../models/Bill.model';
import { FeedbackModel } from '../models/Feedback.model';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model';
import { HousekeepingTaskModel } from '../models/HousekeepingTask.model';
import { UserModel } from '../models/User.model';

// Create a custom Request type that includes the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class ReportController {
  /**
   * Generate a new report
   * @route POST /api/v1/reports/generate
   */
  static async generateReport(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validatedData = reportValidationSchemas.reportGeneration.parse(
        req.body
      );
      const { reportType, format, parameters, expiresAt } = validatedData;
      const generatedBy = req.user?.id || 'system';

      // Generate report data based on type
      let reportData: any;

      switch (reportType) {
        case ReportType.OCCUPANCY:
          reportData =
            await ReportController.generateOccupancyReport(parameters);
          break;
        case ReportType.REVENUE:
          reportData = await ReportController.generateRevenueReport(parameters);
          break;
        case ReportType.GUEST_FEEDBACK:
          reportData =
            await ReportController.generateFeedbackReport(parameters);
          break;
        case ReportType.MAINTENANCE:
          reportData =
            await ReportController.generateMaintenanceReport(parameters);
          break;
        case ReportType.HOUSEKEEPING:
          reportData =
            await ReportController.generateHousekeepingReport(parameters);
          break;
        case ReportType.STAFF_PERFORMANCE:
          reportData =
            await ReportController.generateStaffPerformanceReport(parameters);
          break;
        default:
          ResponseUtil.error(res, 'Invalid report type', 400);
          return;
      }

      // Create report document
      const report = new ReportModel({
        reportType,
        generatedBy,
        parameters,
        data: reportData,
        format,
        generatedDate: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      await report.save();

      ResponseUtil.success(res, {
        message: 'Report generated successfully',
        report: {
          id: report._id,
          reportType: report.reportType,
          format: report.format,
          generatedDate: report.generatedDate,
          size: report.size,
          status: report.status,
          data: format === ReportFormat.JSON ? reportData : undefined,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to generate report',
          500
        );
      }
    }
  }

  /**
   * Get all reports with filtering and pagination
   * @route GET /api/v1/reports
   */
  static async getAllReports(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = reportValidationSchemas.reportFilter.parse(
        req.query
      );
      const {
        reportType,
        format,
        generatedBy,
        startDate,
        endDate,
        status,
        page = 1,
        limit = 10,
        sortBy = 'generatedDate',
        sortOrder = 'desc',
      } = validatedQuery;

      // Build filter object
      const filter: any = {};

      if (reportType) filter.reportType = reportType;
      if (format) filter.format = format;
      if (generatedBy) filter.generatedBy = generatedBy;
      if (status) {
        // Filter by virtual status field requires aggregation
        // For now, we'll handle basic date-based status filtering
        const now = new Date();
        switch (status) {
          case 'expired':
            filter.expiresAt = { $lt: now };
            break;
          case 'new':
            filter.generatedDate = {
              $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            };
            break;
          case 'recent':
            filter.generatedDate = {
              $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            };
            break;
          case 'old':
            filter.generatedDate = {
              $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            };
            break;
        }
      }

      if (startDate || endDate) {
        filter.generatedDate = {};
        if (startDate) filter.generatedDate.$gte = new Date(startDate);
        if (endDate) filter.generatedDate.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [reports, total] = await Promise.all([
        ReportModel.find(filter)
          .populate('generatedBy', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .select('-data'), // Exclude large data field from list view
        ReportModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      ResponseUtil.success(res, {
        reports,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to fetch reports',
          500
        );
      }
    }
  }

  /**
   * Get report by ID
   * @route GET /api/v1/reports/:id
   */
  static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid report ID', 400);
        return;
      }

      const report = await ReportModel.findById(id).populate(
        'generatedBy',
        'firstName lastName email'
      );

      if (!report) {
        ResponseUtil.error(res, 'Report not found', 404);
        return;
      }

      ResponseUtil.success(res, { report });
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to fetch report', 500);
    }
  }

  /**
   * Download report in specified format
   * @route GET /api/v1/reports/:id/download
   */
  static async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedQuery = reportValidationSchemas.reportDownload.parse(
        req.query
      );
      const { format, includeMetadata } = validatedQuery;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid report ID', 400);
        return;
      }

      const report = await ReportModel.findById(id);

      if (!report) {
        ResponseUtil.error(res, 'Report not found', 404);
        return;
      }

      const downloadFormat = format || report.format;
      const filename = `${report.reportType}_${report.generatedDate.toISOString().split('T')[0]}`;

      // Set appropriate headers
      switch (downloadFormat) {
        case ReportFormat.JSON:
          res.setHeader('Content-Type', 'application/json');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.json"`
          );
          res.json(includeMetadata ? report.toJSON() : report.data);
          break;
        case ReportFormat.CSV:
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.csv"`
          );
          res.send(ReportController.convertToCSV(report.data));
          break;
        case ReportFormat.EXCEL:
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.xlsx"`
          );
          // For now, return JSON with Excel headers (would need xlsx library for actual Excel format)
          res.json(report.data);
          break;
        case ReportFormat.PDF:
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.pdf"`
          );
          // For now, return JSON with PDF headers (would need PDF generation library)
          res.json(report.data);
          break;
        default:
          ResponseUtil.error(res, 'Unsupported format', 400);
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to download report',
          500
        );
      }
    }
  }

  /**
   * Update report
   * @route PUT /api/v1/reports/:id
   */
  static async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = reportValidationSchemas.reportUpdate.parse(
        req.body
      );

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid report ID', 400);
        return;
      }

      const report = await ReportModel.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: true,
      }).populate('generatedBy', 'firstName lastName email');

      if (!report) {
        ResponseUtil.error(res, 'Report not found', 404);
        return;
      }

      ResponseUtil.success(res, {
        message: 'Report updated successfully',
        report,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to update report',
          500
        );
      }
    }
  }

  /**
   * Delete report
   * @route DELETE /api/v1/reports/:id
   */
  static async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid report ID', 400);
        return;
      }

      const report = await ReportModel.findByIdAndDelete(id);

      if (!report) {
        ResponseUtil.error(res, 'Report not found', 404);
        return;
      }

      ResponseUtil.success(res, {
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to delete report', 500);
    }
  }

  /**
   * Bulk delete reports
   * @route DELETE /api/v1/reports/bulk-delete
   */
  static async bulkDeleteReports(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = reportValidationSchemas.bulkDelete.parse(req.body);
      const { reportIds } = validatedData;

      const objectIds = reportIds.map(id => {
        if (!Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid report ID: ${id}`);
        }
        return new Types.ObjectId(id);
      });

      const result = await ReportModel.deleteMany({
        _id: { $in: objectIds },
      });

      ResponseUtil.success(res, {
        message: `Successfully deleted ${result.deletedCount} reports`,
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to delete reports',
          500
        );
      }
    }
  }

  /**
   * Get report statistics
   * @route GET /api/v1/reports/statistics
   */
  static async getReportStatistics(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = reportValidationSchemas.reportStats.parse(
        req.query
      );
      const { startDate, endDate } = validatedQuery;

      const matchStage: any = {};
      if (startDate || endDate) {
        matchStage.generatedDate = {};
        if (startDate) matchStage.generatedDate.$gte = new Date(startDate);
        if (endDate) matchStage.generatedDate.$lte = new Date(endDate);
      }

      const [
        totalReports,
        reportsByType,
        reportsByFormat,
        reportsByUser,
        recentActivity,
      ] = await Promise.all([
        // Total reports count
        ReportModel.countDocuments(matchStage),

        // Reports by type
        ReportModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$reportType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Reports by format
        ReportModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$format', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Reports by user
        ReportModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$generatedBy', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $project: {
              count: 1,
              user: { $arrayElemAt: ['$user', 0] },
            },
          },
        ]),

        // Recent activity (last 7 days)
        ReportModel.aggregate([
          {
            $match: {
              ...matchStage,
              generatedDate: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$generatedDate' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      // Calculate storage usage
      const storageStats = await ReportModel.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            dataSize: {
              $strLenCP: {
                $cond: {
                  if: { $eq: [{ $type: '$data' }, 'string'] },
                  then: '$data',
                  else: { $toString: '$data' },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$dataSize' },
            avgSize: { $avg: '$dataSize' },
          },
        },
      ]);

      ResponseUtil.success(res, {
        statistics: {
          totalReports,
          reportsByType,
          reportsByFormat,
          reportsByUser,
          recentActivity,
          storage: storageStats[0] || { totalSize: 0, avgSize: 0 },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to fetch statistics',
          500
        );
      }
    }
  }

  /**
   * Clean up expired reports
   * @route POST /api/v1/reports/cleanup
   */
  static async cleanupReports(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = reportValidationSchemas.reportCleanup.parse(
        req.body
      );
      const { olderThan, reportType, format, dryRun } = validatedData;

      const filter: any = {};

      if (olderThan) {
        filter.generatedDate = { $lt: new Date(olderThan) };
      } else {
        // Default: older than 30 days
        filter.generatedDate = {
          $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };
      }

      if (reportType) filter.reportType = reportType;
      if (format) filter.format = format;

      if (dryRun) {
        const count = await ReportModel.countDocuments(filter);
        const reports = await ReportModel.find(filter)
          .select('reportType format generatedDate')
          .limit(10);

        ResponseUtil.success(res, {
          message: 'Dry run completed',
          reportsToDelete: count,
          preview: reports,
        });
      } else {
        const result = await ReportModel.deleteMany(filter);

        ResponseUtil.success(res, {
          message: `Successfully cleaned up ${result.deletedCount} reports`,
          deletedCount: result.deletedCount,
        });
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          error.message || 'Failed to cleanup reports',
          500
        );
      }
    }
  }

  // Report generation methods
  private static async generateOccupancyReport(params: any) {
    const { startDate, endDate, roomType } = params;

    const filter: any = {
      checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (roomType) {
      const rooms = await RoomModel.find({ type: roomType }).select('_id');
      filter.roomId = { $in: rooms.map(r => r._id) };
    }

    const [reservations, totalRooms, occupancyByDate] = await Promise.all([
      ReservationModel.find(filter).populate('roomId'),
      RoomModel.countDocuments(roomType ? { type: roomType } : {}),
      ReservationModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' },
            },
            occupiedRooms: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const occupancyRate =
      totalRooms > 0 ? (reservations.length / totalRooms) * 100 : 0;

    return {
      summary: {
        totalReservations: reservations.length,
        totalRooms,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        period: { startDate, endDate },
      },
      dailyOccupancy: occupancyByDate,
      reservations: reservations.slice(0, 100), // Limit for performance
    };
  }

  private static async generateRevenueReport(params: any) {
    const { startDate, endDate, breakdown, currency } = params;

    const filter = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    const [bills, revenueByPeriod] = await Promise.all([
      BillModel.find(filter),
      BillModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: {
                format:
                  breakdown === 'monthly'
                    ? '%Y-%m'
                    : breakdown === 'weekly'
                      ? '%Y-%U'
                      : '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            totalRevenue: { $sum: '$totalAmount' },
            billCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const averageBill = bills.length > 0 ? totalRevenue / bills.length : 0;

    return {
      summary: {
        totalRevenue,
        averageBill: Math.round(averageBill * 100) / 100,
        totalBills: bills.length,
        currency,
        period: { startDate, endDate },
      },
      revenueByPeriod,
      bills: bills.slice(0, 100), // Limit for performance
    };
  }

  private static async generateFeedbackReport(params: any) {
    const { startDate, endDate, category, minRating, includeComments } = params;

    const filter: any = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (category) filter.category = category;
    if (minRating) filter.rating = { $gte: minRating };

    const [feedback, ratingDistribution, categoryBreakdown] = await Promise.all(
      [
        FeedbackModel.find(filter).populate('guestId roomId'),
        FeedbackModel.aggregate([
          { $match: filter },
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        FeedbackModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgRating: { $avg: '$rating' },
            },
          },
          { $sort: { avgRating: -1 } },
        ]),
      ]
    );

    const averageRating =
      feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0;

    return {
      summary: {
        totalFeedback: feedback.length,
        averageRating: Math.round(averageRating * 100) / 100,
        period: { startDate, endDate },
      },
      ratingDistribution,
      categoryBreakdown,
      feedback: includeComments
        ? feedback.slice(0, 100)
        : feedback
            .map(f => ({ ...f.toObject(), comment: undefined }))
            .slice(0, 100),
    };
  }

  private static async generateMaintenanceReport(params: any) {
    const { startDate, endDate, category, priority, status, includeCosting } =
      params;

    const filter: any = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const [requests, statusBreakdown, categoryBreakdown, priorityBreakdown] =
      await Promise.all([
        MaintenanceRequestModel.find(filter).populate(
          'roomId assignedTechnicianId'
        ),
        MaintenanceRequestModel.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        MaintenanceRequestModel.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgCost: { $avg: '$cost' },
            },
          },
          { $sort: { count: -1 } },
        ]),
        MaintenanceRequestModel.aggregate([
          { $match: filter },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    const totalCost = includeCosting
      ? requests.reduce((sum, req) => sum + (req.cost || 0), 0)
      : 0;

    return {
      summary: {
        totalRequests: requests.length,
        totalCost: includeCosting ? totalCost : undefined,
        period: { startDate, endDate },
      },
      statusBreakdown,
      categoryBreakdown,
      priorityBreakdown,
      requests: requests.slice(0, 100),
    };
  }

  private static async generateHousekeepingReport(params: any) {
    const { startDate, endDate, taskType, staffId, includePerformanceMetrics } =
      params;

    const filter: any = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (taskType) filter.taskType = taskType;
    if (staffId) filter.assignedStaffId = staffId;

    const [tasks, tasksByType, tasksByStatus, staffPerformance] =
      await Promise.all([
        HousekeepingTaskModel.find(filter).populate('roomId assignedStaffId'),
        HousekeepingTaskModel.aggregate([
          { $match: filter },
          { $group: { _id: '$taskType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        HousekeepingTaskModel.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        includePerformanceMetrics
          ? HousekeepingTaskModel.aggregate([
              { $match: { ...filter, status: 'completed' } },
              {
                $group: {
                  _id: '$assignedStaffId',
                  completedTasks: { $sum: 1 },
                  avgCompletionTime: {
                    $avg: {
                      $divide: [
                        { $subtract: ['$completedDate', '$scheduledDate'] },
                        1000 * 60 * 60, // Convert to hours
                      ],
                    },
                  },
                },
              },
              { $sort: { completedTasks: -1 } },
            ])
          : [],
      ]);

    return {
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => (t.status as string) === 'completed')
          .length,
        period: { startDate, endDate },
      },
      tasksByType,
      tasksByStatus,
      staffPerformance: includePerformanceMetrics
        ? staffPerformance
        : undefined,
      tasks: tasks.slice(0, 100),
    };
  }

  private static async generateStaffPerformanceReport(params: any) {
    const {
      startDate,
      endDate,
      staffId,
      department,
      includeRatings,
      includeTaskCompletion,
    } = params;

    const filter: any = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (staffId) filter._id = staffId;
    if (department) filter.department = department;

    const [staff, taskCompletion, ratings] = await Promise.all([
      UserModel.find(filter),
      includeTaskCompletion
        ? HousekeepingTaskModel.aggregate([
            {
              $match: {
                assignedStaffId: {
                  $in: await UserModel.find(filter).distinct('_id'),
                },
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
            },
            {
              $group: {
                _id: '$assignedStaffId',
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
              },
            },
          ])
        : [],
      includeRatings
        ? FeedbackModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
                category: 'staff',
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
              },
            },
          ])
        : [],
    ]);

    return {
      summary: {
        totalStaff: staff.length,
        period: { startDate, endDate },
      },
      staff: staff.slice(0, 100),
      taskCompletion: includeTaskCompletion ? taskCompletion : undefined,
      ratings: includeRatings ? ratings[0] : undefined,
    };
  }

  // Utility method to convert data to CSV format
  private static convertToCSV(data: any): string {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    // Simple CSV conversion for basic data structures
    if (Array.isArray(data)) {
      if (data.length === 0) return 'No data available';

      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          })
          .join(',')
      );

      return [csvHeaders, ...csvRows].join('\n');
    }

    // For object data, convert to key-value pairs
    const entries = Object.entries(data);
    return entries.map(([key, value]) => `${key},${value}`).join('\n');
  }
}
