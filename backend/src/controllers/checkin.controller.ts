import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { CheckInModel } from '../models/CheckIn.model';
import { logger } from '../utils';
import { checkInValidationSchemas } from '../validations/checkIn.validation';

/**
 * CheckIn Controller
 * Handles all CRUD operations and check-in management for CheckIn model
 */

export class CheckInController {
  /**
   * Create a new check-in record
   * @route POST /api/v1/checkins
   */
  async createCheckIn(req: Request, res: Response) {
    try {
      const checkInData = req.body;

      // Check if a check-in already exists for this reservation
      const existingCheckIn = await CheckInModel.findOne({
        reservationId: checkInData.reservationId,
      });
      if (existingCheckIn) {
        logger.error('Check-in already exists for this reservation', {
          reservationId: checkInData.reservationId,
        });
        return ResponseUtil.error(
          res,
          'Check-in already exists for this reservation',
          400
        );
      }

      const checkIn = await CheckInModel.create(checkInData);
      logger.info('Check-in created successfully', { checkIn });
      return ResponseUtil.success(
        res,
        checkIn,
        'Check-in created successfully'
      );
    } catch (error) {
      logger.error('Error creating check-in', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all check-in records with pagination, search, and filtering
   * @route GET /api/v1/checkins
   */
  async getAllCheckIns(req: Request, res: Response) {
    try {
      const queryData = {
        query: (req.query['query'] as string) || undefined,
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 10,
        sortBy: (req.query['sortBy'] as string) || 'checkInTime',
        sortOrder: (req.query['sortOrder'] as string) || 'desc',
        status: (req.query['status'] as string) || undefined,
        roomId: (req.query['roomId'] as string) || undefined,
        guestId: (req.query['guestId'] as string) || undefined,
        startDate: req.query['dateFrom']
          ? new Date(req.query['dateFrom'] as string)
          : undefined,
        endDate: req.query['dateTo']
          ? new Date(req.query['dateTo'] as string)
          : undefined,
      };

      const queryValidation =
        checkInValidationSchemas.checkInSearch.safeParse(queryData);
      if (!queryValidation.success) {
        logger.warn('Invalid query parameters for getAllCheckIns', {
          errors: queryValidation.error.issues,
        });

        const validationErrors = queryValidation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        ResponseUtil.badRequest(
          res,
          'Invalid query parameters',
          validationErrors
        );
        return;
      }

      const {
        query: search,
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        roomId,
        guestId,
        startDate,
        endDate,
      } = queryValidation.data;

      // Build search query
      const searchQuery: any = {};

      if (search) {
        searchQuery.$or = [
          { assignedRoomNumber: { $regex: search, $options: 'i' } },
          { specialInstructions: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) {
        searchQuery.status = status;
      }

      if (roomId) {
        searchQuery.roomId = roomId;
      }

      if (guestId) {
        searchQuery.guestId = guestId;
      }

      if (startDate || endDate) {
        searchQuery.checkInTime = {};
        if (startDate) {
          searchQuery.checkInTime.$gte = startDate;
        }
        if (endDate) {
          searchQuery.checkInTime.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [checkIns, totalCount] = await Promise.all([
        CheckInModel.find(searchQuery)
          .populate('reservationId', 'guestName checkInDate checkOutDate')
          .populate('roomId', 'roomNumber roomType')
          .populate('guestId', 'firstName lastName email phone')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        CheckInModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Check-ins fetched successfully', { count: checkIns.length });
      return ResponseUtil.success(
        res,
        checkIns,
        'Check-ins fetched successfully',
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
      logger.error('Error getting all check-ins', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single check-in record by ID
   * @route GET /api/v1/checkins/:id
   */
  async getCheckInById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checkIn = await CheckInModel.findById(id)
        .populate(
          'reservationId',
          'guestName checkInDate checkOutDate totalAmount'
        )
        .populate('roomId', 'roomNumber roomType floor amenities')
        .populate('guestId', 'firstName lastName email phone');

      if (!checkIn) {
        logger.error('Check-in not found', { id });
        return ResponseUtil.error(res, 'Check-in not found', 404);
      }

      logger.info('Check-in fetched successfully', { checkInId: id });
      return ResponseUtil.success(
        res,
        checkIn,
        'Check-in fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting check-in by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a check-in record by ID
   * @route PUT /api/v1/checkins/:id
   */
  async updateCheckIn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const checkIn = await CheckInModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone');

      if (!checkIn) {
        logger.error('Check-in not found', { id });
        return ResponseUtil.error(res, 'Check-in not found', 404);
      }

      logger.info('Check-in updated successfully', { checkInId: id });
      return ResponseUtil.success(
        res,
        checkIn,
        'Check-in updated successfully'
      );
    } catch (error) {
      logger.error('Error updating check-in', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a check-in record by ID
   * @route DELETE /api/v1/checkins/:id
   */
  async deleteCheckIn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checkIn = await CheckInModel.findByIdAndDelete(id);

      if (!checkIn) {
        logger.error('Check-in not found', { id });
        return ResponseUtil.error(res, 'Check-in not found', 404);
      }

      logger.info('Check-in deleted successfully', { checkInId: id });
      return ResponseUtil.success(
        res,
        checkIn,
        'Check-in deleted successfully'
      );
    } catch (error) {
      logger.error('Error deleting check-in', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Complete check-in process
   * @route POST /api/v1/checkins/:id/complete
   */
  async completeCheckIn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const completionData = req.body;

      const checkIn = await CheckInModel.findById(id);
      if (!checkIn) {
        logger.error('Check-in not found', { id });
        return ResponseUtil.error(res, 'Check-in not found', 404);
      }

      // Update check-in with completion data
      const updatedCheckIn = await CheckInModel.findByIdAndUpdate(
        id,
        {
          ...completionData,
          checkInTime: completionData.checkInTime || new Date(),
          keyIssued: true,
          status: 'completed',
        },
        { new: true, runValidators: true }
      )
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone');

      logger.info('Check-in completed successfully', { checkInId: id });
      return ResponseUtil.success(
        res,
        updatedCheckIn,
        'Check-in completed successfully'
      );
    } catch (error) {
      logger.error('Error completing check-in', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get check-in statistics
   * @route GET /api/v1/checkins/stats
   */
  async getCheckInStats(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const [totalCheckIns, todayCheckIns, pendingCheckIns, completedCheckIns] =
        await Promise.all([
          CheckInModel.countDocuments(),
          CheckInModel.countDocuments({
            checkInTime: { $gte: startOfDay, $lte: endOfDay },
          }),
          CheckInModel.countDocuments({ status: 'pending' }),
          CheckInModel.countDocuments({ status: 'completed' }),
        ]);

      const stats = {
        totalCheckIns,
        todayCheckIns,
        pendingCheckIns,
        completedCheckIns,
      };

      logger.info('Check-in statistics fetched successfully', { stats });
      return ResponseUtil.success(
        res,
        stats,
        'Check-in statistics fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting check-in statistics', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get active check-ins (checked in but not checked out)
   * @route GET /api/v1/checkins/active
   */
  async getActiveCheckIns(req: Request, res: Response) {
    try {
      const activeCheckIns = await CheckInModel.find({
        status: 'completed',
        checkOutTime: { $exists: false },
      })
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone')
        .sort({ checkInTime: -1 });

      logger.info('Active check-ins fetched successfully', {
        count: activeCheckIns.length,
      });
      return ResponseUtil.success(
        res,
        activeCheckIns,
        'Active check-ins fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting active check-ins', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
