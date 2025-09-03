import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification.model';
import { notificationValidationSchemas } from '../validations/notification.validation';
import { ResponseUtil } from '../utils/response';
import { Types } from 'mongoose';

export class NotificationController {
  /**
   * Create a new notification
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Create notification (validation handled by middleware)
      const notification = new NotificationModel(req.body);
      const savedNotification = await notification.save();

      ResponseUtil.success(
        res,
        savedNotification,
        'Notification created successfully',
        201
      );
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to create notification',
        500,
        error.message
      );
    }
  }

  /**
   * Get all notifications with optional filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Extract validated query parameters (validation handled by middleware)
      const {
        recipientId,
        recipientType,
        type,
        priority,
        isRead,
        dateFrom,
        dateTo,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query as any;

      // Build filter object
      const filter: any = {};
      if (recipientId) filter.recipientId = recipientId;
      if (recipientType) filter.recipientType = recipientType;
      if (type) filter.type = type;
      if (priority) filter.priority = priority;
      if (isRead !== undefined) filter.isRead = isRead;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [notifications, total] = await Promise.all([
        NotificationModel.find(filter)
          .populate('recipientId')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        NotificationModel.countDocuments(filter),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
      };

      ResponseUtil.success(
        res,
        response,
        'Notifications retrieved successfully'
      );
    } catch {
      ResponseUtil.internalError(res, 'Failed to retrieve notifications');
    }
  }

  /**
   * Get notification by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid notification ID', 400);
        return;
      }

      const notification = await NotificationModel.findById(id)
        .populate('recipientId', 'firstName lastName email')
        .lean();

      if (!notification) {
        ResponseUtil.error(res, 'Notification not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        notification,
        'Notification retrieved successfully'
      );
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to retrieve notification',
        500,
        error.message
      );
    }
  }

  /**
   * Update notification
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData =
        notificationValidationSchemas.notificationUpdate.parse(req.body);

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid notification ID', 400);
        return;
      }

      const notification = await NotificationModel.findByIdAndUpdate(
        id,
        validatedData,
        { new: true, runValidators: true }
      )
        .populate('recipientId', 'firstName lastName email')
        .lean();

      if (!notification) {
        ResponseUtil.error(res, 'Notification not found', 404);
        return;
      }

      ResponseUtil.success(
        res,
        notification,
        'Notification updated successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.validationError(
          res,
          error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else if (error.name === 'ValidationError') {
        ResponseUtil.error(
          res,
          'Database validation failed',
          400,
          error.errors
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to update notification',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Delete notification
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid notification ID', 400);
        return;
      }

      const notification = await NotificationModel.findByIdAndDelete(id);

      if (!notification) {
        ResponseUtil.error(res, 'Notification not found', 404);
        return;
      }

      ResponseUtil.success(res, { id }, 'Notification deleted successfully');
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to delete notification',
        500,
        error.message
      );
    }
  }

  /**
   * Search notifications
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const validatedData =
        notificationValidationSchemas.notificationSearch.parse(req.query);
      const {
        query,
        type,
        priority,
        recipientId,
        isRead,
        page = 1,
        limit = 10,
        sortBy = 'relevance',
        sortOrder = 'desc',
      } = validatedData;

      // Build search query
      const searchQuery: any = {};

      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { message: { $regex: query, $options: 'i' } },
        ];
      }

      if (type) {
        searchQuery.type = type;
      }
      if (priority) {
        searchQuery.priority = priority;
      }
      if (recipientId) {
        searchQuery.recipientId = recipientId;
      }
      if (isRead !== undefined) {
        searchQuery.isRead = isRead;
      }

      // Calculate pagination
      const pageNum = Math.max(1, page);
      const limitNum = Math.min(100, Math.max(1, limit));
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort: any = {};
      if (sortBy === 'relevance') {
        sort.createdAt = -1; // Default to newest first for relevance
      } else if (sortBy === 'priority') {
        // Sort by priority field directly
        sort.priority = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      // Execute search
      const [notifications, total] = await Promise.all([
        NotificationModel.find(searchQuery)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('recipientId', 'firstName lastName email')
          .lean(),
        NotificationModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      ResponseUtil.success(
        res,
        {
          notifications,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
          searchQuery: query,
        },
        'Notification search completed successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.validationError(
          res,
          error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to search notifications',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Mark notifications as read/unread (bulk operation)
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = notificationValidationSchemas.markAsRead.parse(
        req.body
      );
      const { notificationIds, isRead = true } = validatedData;

      // Validate all notification IDs
      const invalidIds = notificationIds.filter(
        id => !Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        ResponseUtil.error(
          res,
          'Invalid notification IDs',
          400,
          invalidIds.map(id => ({
            field: 'notificationIds',
            message: `Invalid notification ID: ${id}`,
            code: 'INVALID_OBJECT_ID',
            value: id,
          }))
        );
        return;
      }

      const updateData: any = {
        isRead,
        ...(isRead && { readDate: new Date() }),
      };

      if (!isRead) {
        updateData.$unset = { readDate: 1 };
      }

      const result = await NotificationModel.updateMany(
        { _id: { $in: notificationIds } },
        updateData
      );

      ResponseUtil.success(
        res,
        {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
          notificationIds,
          isRead,
        },
        `Notifications marked as ${isRead ? 'read' : 'unread'} successfully`
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.validationError(
          res,
          error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to update notification status',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Bulk delete notifications
   */
  static async bulkDelete(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = notificationValidationSchemas.bulkDelete.parse(
        req.body
      );
      const { notificationIds } = validatedData;

      // Validate all notification IDs
      const invalidIds = notificationIds.filter(
        id => !Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        ResponseUtil.error(
          res,
          'Invalid notification IDs',
          400,
          invalidIds.map(id => ({
            field: 'notificationIds',
            message: `Invalid notification ID: ${id}`,
            code: 'INVALID_OBJECT_ID',
            value: id,
          }))
        );
        return;
      }

      const result = await NotificationModel.deleteMany({
        _id: { $in: notificationIds },
      });

      ResponseUtil.success(
        res,
        {
          deletedCount: result.deletedCount,
          notificationIds,
        },
        'Notifications deleted successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.validationError(
          res,
          error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to delete notifications',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Get notification statistics
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters =
        notificationValidationSchemas.notificationStatsFilter.parse(req.query);

      // Build base query
      const baseQuery: any = {};
      if (validatedFilters.recipientId) {
        baseQuery.recipientId = validatedFilters.recipientId;
      }
      if (validatedFilters.recipientType) {
        baseQuery.recipientType = validatedFilters.recipientType;
      }
      if (validatedFilters.type) {
        baseQuery.type = validatedFilters.type;
      }
      if (validatedFilters.priority) {
        baseQuery.priority = validatedFilters.priority;
      }
      if (validatedFilters.dateFrom || validatedFilters.dateTo) {
        baseQuery.createdAt = {};
        if (validatedFilters.dateFrom) {
          baseQuery.createdAt.$gte = new Date(validatedFilters.dateFrom);
        }
        if (validatedFilters.dateTo) {
          baseQuery.createdAt.$lte = new Date(validatedFilters.dateTo);
        }
      }

      // Execute aggregation queries
      const [totalStats, typeStats, priorityStats, readStats, recentStats] =
        await Promise.all([
          // Total notifications
          NotificationModel.countDocuments(baseQuery),

          // By type
          NotificationModel.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),

          // By priority
          NotificationModel.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),

          // Read vs Unread
          NotificationModel.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$isRead', count: { $sum: 1 } } },
          ]),

          // Recent notifications (last 7 days)
          NotificationModel.countDocuments({
            ...baseQuery,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          }),
        ]);

      // Process read stats
      const readStatsProcessed = {
        read: readStats.find(stat => stat._id === true)?.count || 0,
        unread: readStats.find(stat => stat._id === false)?.count || 0,
      };

      // Get urgent notifications count
      const urgentCount = await NotificationModel.countDocuments({
        ...baseQuery,
        priority: 'urgent',
        isRead: false,
      });

      ResponseUtil.success(
        res,
        {
          total: totalStats,
          byType: typeStats,
          byPriority: priorityStats,
          readStatus: readStatsProcessed,
          recent: recentStats,
          urgent: urgentCount,
          readPercentage:
            totalStats > 0
              ? Math.round((readStatsProcessed.read / totalStats) * 100)
              : 0,
        },
        'Notification statistics retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.validationError(
          res,
          error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to retrieve notification statistics',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Mark all notifications as read for a specific recipient
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId } = req.params;

      if (!recipientId) {
        ResponseUtil.error(res, 'Recipient ID is required', 400);
        return;
      }

      const result = await NotificationModel.updateMany(
        { recipientId, isRead: false },
        { isRead: true, readDate: new Date() }
      );

      ResponseUtil.success(
        res,
        {
          modifiedCount: result.modifiedCount,
          recipientId,
        },
        'All notifications marked as read successfully'
      );
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to mark all notifications as read',
        500,
        error.message
      );
    }
  }

  /**
   * Get unread notification count for a specific recipient
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId } = req.params;

      if (!recipientId) {
        ResponseUtil.error(res, 'Recipient ID is required', 400);
        return;
      }

      const count = await NotificationModel.countDocuments({
        recipientId,
        isRead: false,
      });

      ResponseUtil.success(
        res,
        { count, recipientId },
        'Unread notification count retrieved successfully'
      );
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to get unread notification count',
        500,
        error.message
      );
    }
  }
}
