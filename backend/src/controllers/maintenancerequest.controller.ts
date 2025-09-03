import { Request, Response } from 'express';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model';
import { ResponseUtil } from '../utils/response';
import { maintenanceValidationSchemas } from '../validations/maintenance.validation';
import { z } from 'zod';
import mongoose from 'mongoose';

export class MaintenanceRequestController {
  /**
   * Create a new maintenance request
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData =
        maintenanceValidationSchemas.maintenanceRequest.parse(req.body);

      // Map validation schema fields to model fields
      const maintenanceRequestData = {
        ...validatedData,
        category: validatedData.maintenanceType,
        assignedTechnicianId: validatedData.assignedTo,
      };

      // Remove the validation schema fields that don't exist in the model
      if ('maintenanceType' in maintenanceRequestData) {
        delete (maintenanceRequestData as any).maintenanceType;
      }
      if ('assignedTo' in maintenanceRequestData) {
        delete (maintenanceRequestData as any).assignedTo;
      }

      const maintenanceRequest = new MaintenanceRequestModel(
        maintenanceRequestData
      );
      const savedRequest = await maintenanceRequest.save();

      ResponseUtil.success(
        res,
        savedRequest,
        'Maintenance request created successfully',
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to create maintenance request', 500);
      }
    }
  }

  /**
   * Get all maintenance requests with optional filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const requests = await MaintenanceRequestModel.find()
        .populate('roomId')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await MaintenanceRequestModel.countDocuments();

      const response = {
        requests,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
      };

      ResponseUtil.success(
        res,
        response,
        'Maintenance requests retrieved successfully'
      );
    } catch {
      ResponseUtil.error(res, 'Failed to retrieve maintenance requests', 500);
    }
  }

  /**
   * Search maintenance requests with advanced filtering
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery =
        maintenanceValidationSchemas.maintenanceRequestSearch.parse(req.query);

      const {
        query: q,
        status,
        priority,
        maintenanceType,
        roomId,
        assignedTo,
        reportedBy,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = validatedQuery;

      const filter: any = {};

      // Text search
      if (q) {
        filter.$or = [
          { description: { $regex: q, $options: 'i' } },
          { notes: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ];
      }

      // Status filter
      if (status) {
        if (Array.isArray(status)) {
          filter.status = { $in: status };
        } else {
          filter.status = status;
        }
      }

      // Priority filter
      if (priority) {
        if (Array.isArray(priority)) {
          filter.priority = { $in: priority };
        } else {
          filter.priority = priority;
        }
      }

      // Category filter
      if (maintenanceType) {
        if (Array.isArray(maintenanceType)) {
          filter.category = { $in: maintenanceType };
        } else {
          filter.category = maintenanceType;
        }
      }

      // Room filter
      if (roomId) {
        filter.roomId = roomId;
      }

      // Assigned technician filter
      if (assignedTo) {
        filter.assignedTechnicianId = assignedTo;
      }

      // Reported by filter
      if (reportedBy) {
        filter.reportedBy = reportedBy;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const pageNum = parseInt(page.toString());
      const limitNum = parseInt(limit.toString());
      const skip = (pageNum - 1) * limitNum;

      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const requests = await MaintenanceRequestModel.find(filter)
        .populate('roomId', 'number type')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await MaintenanceRequestModel.countDocuments(filter);

      const response = {
        requests,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        filters: {
          q,
          status,
          priority,
          maintenanceType,
          roomId,
          assignedTo,
          reportedBy,
          startDate,
          endDate,
        },
      };

      ResponseUtil.success(
        res,
        response,
        'Maintenance requests search completed'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to search maintenance requests', 500);
      }
    }
  }

  /**
   * Get maintenance request statistics
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [statusStats, priorityStats, categoryStats, overallStats] =
        await Promise.all([
          // Status distribution
          MaintenanceRequestModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),

          // Priority distribution
          MaintenanceRequestModel.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),

          // Category distribution
          MaintenanceRequestModel.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),

          // Overall statistics
          MaintenanceRequestModel.aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
                  },
                },
                inProgress: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0],
                  },
                },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                  },
                },
                cancelled: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
                  },
                },
                avgCost: { $avg: '$cost' },
                totalCost: { $sum: '$cost' },
              },
            },
          ]),
        ]);

      // Calculate overdue requests
      const overdueCount = await MaintenanceRequestModel.countDocuments({
        status: { $in: ['pending', 'in_progress'] },
        estimatedCompletionDate: { $lt: new Date() },
      });

      const statistics = {
        overview: overallStats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          avgCost: 0,
          totalCost: 0,
        },
        overdue: overdueCount,
        statusDistribution: statusStats,
        priorityDistribution: priorityStats,
        categoryDistribution: categoryStats,
      };

      ResponseUtil.success(
        res,
        statistics,
        'Maintenance request statistics retrieved successfully'
      );
    } catch {
      ResponseUtil.error(res, 'Failed to retrieve statistics', 500);
    }
  }

  /**
   * Get maintenance request by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const request = await MaintenanceRequestModel.findById(id)
        .populate('roomId', 'number type floor')
        .populate('reportedBy', 'firstName lastName email phone')
        .populate('assignedTechnicianId', 'firstName lastName email phone')
        .lean();

      if (!request) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        request,
        'Maintenance request retrieved successfully'
      );
    } catch {
      ResponseUtil.error(res, 'Failed to retrieve maintenance request', 500);
    }
  }

  /**
   * Update maintenance request
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const validatedData =
        maintenanceValidationSchemas.maintenanceRequestUpdate.parse(req.body);

      // Map validation schema fields to model fields
      const updateData: any = { ...validatedData };
      if (validatedData.maintenanceType) {
        updateData.category = validatedData.maintenanceType;
        delete updateData.maintenanceType;
      }
      if (validatedData.assignedTo) {
        updateData.assignedTechnicianId = validatedData.assignedTo;
        delete updateData.assignedTo;
      }

      const updatedRequest = await MaintenanceRequestModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('roomId', 'number type')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .lean();

      if (!updatedRequest) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        updatedRequest,
        'Maintenance request updated successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to update maintenance request', 500);
      }
    }
  }

  /**
   * Delete maintenance request
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const deletedRequest =
        await MaintenanceRequestModel.findByIdAndDelete(id);

      if (!deletedRequest) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        { id },
        'Maintenance request deleted successfully'
      );
    } catch {
      ResponseUtil.error(res, 'Failed to delete maintenance request', 500);
    }
  }

  /**
   * Assign technician to maintenance request
   */
  static async assignTechnician(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const validatedData =
        maintenanceValidationSchemas.maintenanceAssignment.parse(req.body);

      const { assignedTo, scheduledDate } = validatedData;

      const updateData: any = {
        assignedTechnicianId: assignedTo,
        status: 'assigned',
      };

      if (scheduledDate) {
        updateData.estimatedCompletionDate = scheduledDate;
      }

      const updatedRequest = await MaintenanceRequestModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('roomId', 'number type')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .lean();

      if (!updatedRequest) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        updatedRequest,
        'Technician assigned successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to assign technician', 500);
      }
    }
  }

  /**
   * Update maintenance request status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const validatedData =
        maintenanceValidationSchemas.maintenanceStatusUpdate.parse(req.body);

      const updateData: any = {
        status: validatedData.status,
      };

      if (validatedData.notes) {
        updateData.notes = validatedData.notes;
      }

      const updatedRequest = await MaintenanceRequestModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('roomId', 'number type')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .lean();

      if (!updatedRequest) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(res, updatedRequest, 'Status updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to update status', 500);
      }
    }
  }

  /**
   * Complete maintenance request
   */
  static async complete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid maintenance request ID', 400);
        return;
      }

      const validatedData =
        maintenanceValidationSchemas.maintenanceCompletion.parse(req.body);

      const { actualEndTime, actualCost, completionNotes } = validatedData;

      const updateData: any = {
        status: 'completed',
        actualCompletionDate: actualEndTime || new Date(),
      };

      if (actualCost !== undefined) {
        updateData.cost = actualCost;
      }

      if (completionNotes) {
        updateData.notes = completionNotes;
      }

      const updatedRequest = await MaintenanceRequestModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('roomId', 'number type')
        .populate('reportedBy', 'firstName lastName email')
        .populate('assignedTechnicianId', 'firstName lastName email')
        .lean();

      if (!updatedRequest) {
        ResponseUtil.error(res, 'Maintenance request not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        updatedRequest,
        'Maintenance request completed successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        ResponseUtil.validationError(
          res,
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(res, 'Failed to complete maintenance request', 500);
      }
    }
  }
}
