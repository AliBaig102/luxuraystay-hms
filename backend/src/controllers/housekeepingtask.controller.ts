import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { HousekeepingTaskModel } from '../models/HousekeepingTask.model';
import { logger } from '../utils';
import { housekeepingValidationSchemas } from '../validations/housekeeping.validation';
import { TaskStatus } from '../types/models';

/**
 * Housekeeping Task Controller
 * Handles all CRUD operations and housekeeping task management for HousekeepingTask model
 */

export class HousekeepingTaskController {
  /**
   * Create a new housekeeping task
   * @route POST /api/v1/housekeeping-tasks
   */
  async createHousekeepingTask(req: Request, res: Response) {
    try {
      const taskData = req.body;

      const task = await HousekeepingTaskModel.create(taskData);
      logger.info('Housekeeping task created successfully', { task });
      return ResponseUtil.success(
        res,
        task,
        'Housekeeping task created successfully',
        201
      );
    } catch (error) {
      logger.error('Error creating housekeeping task', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all housekeeping tasks with pagination, search, and filtering
   * @route GET /api/v1/housekeeping-tasks
   */
  async getAllHousekeepingTasks(req: Request, res: Response) {
    try {
      const queryData = {
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 10,
        status: (req.query['status'] as string) || undefined,
        priority: (req.query['priority'] as string) || undefined,
        taskType: (req.query['taskType'] as string) || undefined,
        roomId: (req.query['roomId'] as string) || undefined,
        assignedTo: (req.query['assignedTo'] as string) || undefined,
        startDate: req.query['startDate']
          ? new Date(req.query['startDate'] as string)
          : undefined,
        endDate: req.query['endDate']
          ? new Date(req.query['endDate'] as string)
          : undefined,
        sortBy: (req.query['sortBy'] as string) || 'scheduledDate',
        sortOrder: (req.query['sortOrder'] as string) || 'asc',
      };

      const queryValidation =
        housekeepingValidationSchemas.housekeepingTaskFilter.safeParse(
          queryData
        );

      if (!queryValidation.success) {
        const validationErrors = queryValidation.error.issues.map(
          (issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })
        );

        return ResponseUtil.error(
          res,
          'Invalid query parameters',
          400,
          validationErrors
        );
      }

      const validatedData = queryValidation.data;
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        priority,
        taskType,
        roomId,
        assignedTo,
        startDate,
        endDate,
      } = validatedData;

      // Build query filters
      const searchQuery: any = {};

      if (req.query.search) {
        const searchTerm = req.query.search as string;
        searchQuery.$or = [
          { notes: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      if (status) {
        searchQuery.status = status;
      }

      if (priority) {
        searchQuery.priority = priority;
      }

      if (taskType) {
        searchQuery.taskType = taskType;
      }

      if (roomId) {
        searchQuery.roomId = roomId;
      }

      if (assignedTo) {
        searchQuery.assignedStaffId = assignedTo;
      }

      if (req.query.isOverdue === 'true') {
        // This will be handled by the virtual field in the model
        searchQuery.$expr = { $eq: ['$isOverdue', true] };
      }

      if (startDate || endDate) {
        searchQuery.scheduledDate = {};
        if (startDate) {
          searchQuery.scheduledDate.$gte = startDate;
        }
        if (endDate) {
          searchQuery.scheduledDate.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [tasks, totalCount] = await Promise.all([
        HousekeepingTaskModel.find(searchQuery)
          .populate('roomId', 'roomNumber roomType floor')
          .populate('assignedStaffId', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        HousekeepingTaskModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Housekeeping tasks fetched successfully', {
        count: tasks.length,
      });
      return ResponseUtil.success(
        res,
        tasks,
        'Housekeeping tasks fetched successfully',
        200,
        {
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
          },
        }
      );
    } catch (error) {
      logger.error('Error getting all housekeeping tasks', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single housekeeping task by ID
   * @route GET /api/v1/housekeeping-tasks/:id
   */
  async getHousekeepingTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await HousekeepingTaskModel.findById(id)
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email');

      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      logger.info('Housekeeping task fetched successfully', {
        taskId: task._id,
      });
      return ResponseUtil.success(
        res,
        task,
        'Housekeeping task fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting housekeeping task by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a housekeeping task by ID
   * @route PUT /api/v1/housekeeping-tasks/:id
   */
  async updateHousekeepingTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const task = await HousekeepingTaskModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email');

      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      logger.info('Housekeeping task updated successfully', {
        taskId: task._id,
      });
      return ResponseUtil.success(
        res,
        task,
        'Housekeeping task updated successfully'
      );
    } catch (error) {
      logger.error('Error updating housekeeping task', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a housekeeping task by ID
   * @route DELETE /api/v1/housekeeping-tasks/:id
   */
  async deleteHousekeepingTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await HousekeepingTaskModel.findByIdAndDelete(id);

      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      logger.info('Housekeeping task deleted successfully', {
        taskId: task._id,
      });
      return ResponseUtil.success(
        res,
        task,
        'Housekeeping task deleted successfully'
      );
    } catch (error) {
      logger.error('Error deleting housekeeping task', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Assign a housekeeping task to staff
   * @route POST /api/v1/housekeeping-tasks/:id/assign
   */
  async assignHousekeepingTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignmentData = req.body;

      const task = await HousekeepingTaskModel.findById(id);
      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      if (task.status === TaskStatus.COMPLETED) {
        logger.error('Cannot assign completed housekeeping task', {
          taskId: id,
        });
        return ResponseUtil.error(
          res,
          'Cannot assign completed housekeeping task',
          400
        );
      }

      // Update task with assignment information
      const updatedTask = await HousekeepingTaskModel.findByIdAndUpdate(
        id,
        {
          assignedStaffId: assignmentData.assignedTo,
          status: TaskStatus.IN_PROGRESS,
          scheduledDate: assignmentData.scheduledDate,
          notes: assignmentData.notes,
        },
        { new: true, runValidators: true }
      )
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Housekeeping task assigned successfully', {
        taskId: id,
        assignedTo: assignmentData.assignedTo,
      });
      return ResponseUtil.success(
        res,
        updatedTask,
        'Housekeeping task assigned successfully'
      );
    } catch (error) {
      logger.error('Error assigning housekeeping task', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update housekeeping task status
   * @route PATCH /api/v1/housekeeping-tasks/:id/status
   */
  async updateHousekeepingTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statusData = req.body;

      const task = await HousekeepingTaskModel.findById(id);
      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      const updateFields: any = {
        status: statusData.status,
        notes: statusData.notes,
      };

      // Set timestamps based on status
      if (statusData.status === TaskStatus.IN_PROGRESS) {
        updateFields.startedAt = new Date();
      } else if (statusData.status === TaskStatus.COMPLETED) {
        updateFields.completedDate = new Date();
      }

      const updatedTask = await HousekeepingTaskModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      )
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Housekeeping task status updated successfully', {
        taskId: id,
        status: statusData.status,
      });
      return ResponseUtil.success(
        res,
        updatedTask,
        'Housekeeping task status updated successfully'
      );
    } catch (error) {
      logger.error('Error updating housekeeping task status', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Complete a housekeeping task
   * @route POST /api/v1/housekeeping-tasks/:id/complete
   */
  async completeHousekeepingTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const completionData = req.body;

      const task = await HousekeepingTaskModel.findById(id);
      if (!task) {
        logger.error('Housekeeping task not found', { id });
        return ResponseUtil.error(res, 'Housekeeping task not found', 404);
      }

      if (task.status === TaskStatus.COMPLETED) {
        logger.error('Housekeeping task already completed', {
          taskId: id,
        });
        return ResponseUtil.error(
          res,
          'Housekeeping task is already completed',
          400
        );
      }

      // Update task with completion information
      const updatedTask = await HousekeepingTaskModel.findByIdAndUpdate(
        id,
        {
          status: TaskStatus.COMPLETED,
          completedDate: new Date(),
          notes: completionData.completionNotes,
        },
        { new: true, runValidators: true }
      )
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Housekeeping task completed successfully', {
        taskId: id,
      });
      return ResponseUtil.success(
        res,
        updatedTask,
        'Housekeeping task completed successfully'
      );
    } catch (error) {
      logger.error('Error completing housekeeping task', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get housekeeping tasks by room ID
   * @route GET /api/v1/housekeeping-tasks/room/:roomId
   */
  async getHousekeepingTasksByRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const tasks = await HousekeepingTaskModel.find({ roomId })
        .populate('assignedStaffId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      logger.info('Housekeeping tasks fetched by room successfully', {
        roomId,
        count: tasks.length,
      });
      return ResponseUtil.success(
        res,
        tasks,
        'Housekeeping tasks fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting housekeeping tasks by room', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get housekeeping tasks by assigned staff ID
   * @route GET /api/v1/housekeeping-tasks/staff/:staffId
   */
  async getHousekeepingTasksByStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const tasks = await HousekeepingTaskModel.find({
        assignedStaffId: staffId,
      })
        .populate('roomId', 'roomNumber roomType floor')
        .sort({ createdAt: -1 });

      logger.info('Housekeeping tasks fetched by staff successfully', {
        staffId,
        count: tasks.length,
      });
      return ResponseUtil.success(
        res,
        tasks,
        'Housekeeping tasks fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting housekeeping tasks by staff', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get overdue housekeeping tasks
   * @route GET /api/v1/housekeeping-tasks/overdue
   */
  async getOverdueHousekeepingTasks(req: Request, res: Response) {
    try {
      const tasks = await HousekeepingTaskModel.find({
        $expr: { $eq: ['$isOverdue', true] },
      })
        .populate('roomId', 'roomNumber roomType floor')
        .populate('assignedStaffId', 'firstName lastName email')
        .sort({ scheduledDate: 1 });

      logger.info('Overdue housekeeping tasks fetched successfully', {
        count: tasks.length,
      });
      return ResponseUtil.success(
        res,
        tasks,
        'Overdue housekeeping tasks fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting overdue housekeeping tasks', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get housekeeping task statistics
   * @route GET /api/v1/housekeeping-tasks/statistics
   */
  async getHousekeepingTaskStatistics(req: Request, res: Response) {
    try {
      const [statusStats, priorityStats, taskTypeStats, overdueCount] =
        await Promise.all([
          HousekeepingTaskModel.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ]),
          HousekeepingTaskModel.aggregate([
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ]),
          HousekeepingTaskModel.aggregate([
            {
              $group: {
                _id: '$taskType',
                count: { $sum: 1 },
                avgCompletionTime: { $avg: '$completionTime' },
              },
            },
          ]),
          HousekeepingTaskModel.countDocuments({
            $expr: { $eq: ['$isOverdue', true] },
          }),
        ]);

      const totalTasks = await HousekeepingTaskModel.countDocuments();
      const completedTasks = await HousekeepingTaskModel.countDocuments({
        status: TaskStatus.COMPLETED,
      });
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const statistics = {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueCount,
        completionRate: Math.round(completionRate * 100) / 100,
        byStatus: statusStats,
        byPriority: priorityStats,
        byTaskType: taskTypeStats,
      };

      logger.info('Housekeeping task statistics fetched successfully');
      return ResponseUtil.success(
        res,
        statistics,
        'Housekeeping task statistics fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting housekeeping task statistics', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
