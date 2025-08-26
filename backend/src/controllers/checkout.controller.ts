import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { CheckOutModel } from '../models/CheckOut.model';
import { CheckInModel } from '../models/CheckIn.model';
import { logger } from '../utils';
import { checkOutValidationSchemas } from '../validations/checkOut.validation';

/**
 * CheckOut Controller
 * Handles all CRUD operations and check-out management for CheckOut model
 */

export class CheckOutController {
  /**
   * Create a new check-out record
   * @route POST /api/v1/checkouts
   */
  async createCheckOut(req: Request, res: Response) {
    try {
      const checkOutData = req.body;

      // Check if a check-out already exists for this check-in
      const existingCheckOut = await CheckOutModel.findOne({
        checkInId: checkOutData.checkInId,
      });
      if (existingCheckOut) {
        logger.error('Check-out already exists for this check-in', {
          checkInId: checkOutData.checkInId,
        });
        return ResponseUtil.error(
          res,
          'Check-out already exists for this check-in',
          400
        );
      }

      // Verify check-in exists
      const checkIn = await CheckInModel.findById(checkOutData.checkInId);
      if (!checkIn) {
        logger.error('Check-in not found', {
          checkInId: checkOutData.checkInId,
        });
        return ResponseUtil.error(res, 'Check-in not found', 404);
      }

      const checkOut = await CheckOutModel.create({
        ...checkOutData,
        reservationId: checkIn.reservationId,
        roomId: checkIn.roomId,
        guestId: checkIn.guestId,
      });

      logger.info('Check-out created successfully', { checkOut });
      return ResponseUtil.success(
        res,
        checkOut,
        'Check-out created successfully'
      );
    } catch (error) {
      logger.error('Error creating check-out', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all check-out records with pagination, search, and filtering
   * @route GET /api/v1/checkouts
   */
  async getAllCheckOuts(req: Request, res: Response) {
    try {
      const queryData = {
        query: (req.query['query'] as string) || undefined,
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 10,
        sortBy: (req.query['sortBy'] as string) || 'expectedCheckOutTime',
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
        checkOutValidationSchemas.checkOutSearch.safeParse(queryData);
      if (!queryValidation.success) {
        logger.warn('Invalid query parameters for getAllCheckOuts', {
          errors: queryValidation.error.issues,
        });

        const validationErrors = queryValidation.error.issues.map(
          (issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })
        );

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
        searchQuery.$or = [{ feedback: { $regex: search, $options: 'i' } }];
      }

      if (status) {
        searchQuery.status = status;
      }

      // Payment status filtering can be added here if needed

      if (roomId) {
        searchQuery.roomId = roomId;
      }

      if (guestId) {
        searchQuery.guestId = guestId;
      }

      if (startDate || endDate) {
        searchQuery.expectedCheckOutTime = {};
        if (startDate) {
          searchQuery.expectedCheckOutTime.$gte = startDate;
        }
        if (endDate) {
          searchQuery.expectedCheckOutTime.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [checkOuts, totalCount] = await Promise.all([
        CheckOutModel.find(searchQuery)
          .populate('checkInId', 'checkInTime assignedRoomNumber')
          .populate('reservationId', 'guestName checkInDate checkOutDate')
          .populate('roomId', 'roomNumber roomType')
          .populate('guestId', 'firstName lastName email phone')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        CheckOutModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Check-outs fetched successfully', {
        count: checkOuts.length,
      });
      return ResponseUtil.success(
        res,
        checkOuts,
        'Check-outs fetched successfully',
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
      logger.error('Error getting all check-outs', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single check-out record by ID
   * @route GET /api/v1/checkouts/:id
   */
  async getCheckOutById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checkOut = await CheckOutModel.findById(id)
        .populate('checkInId', 'checkInTime assignedRoomNumber keyIssued')
        .populate(
          'reservationId',
          'guestName checkInDate checkOutDate totalAmount'
        )
        .populate('roomId', 'roomNumber roomType floor amenities')
        .populate('guestId', 'firstName lastName email phone');

      if (!checkOut) {
        logger.error('Check-out not found', { id });
        return ResponseUtil.error(res, 'Check-out not found', 404);
      }

      logger.info('Check-out fetched successfully', { checkOutId: id });
      return ResponseUtil.success(
        res,
        checkOut,
        'Check-out fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting check-out by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a check-out record by ID
   * @route PUT /api/v1/checkouts/:id
   */
  async updateCheckOut(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const checkOut = await CheckOutModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('checkInId', 'checkInTime assignedRoomNumber')
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone');

      if (!checkOut) {
        logger.error('Check-out not found', { id });
        return ResponseUtil.error(res, 'Check-out not found', 404);
      }

      logger.info('Check-out updated successfully', { checkOutId: id });
      return ResponseUtil.success(
        res,
        checkOut,
        'Check-out updated successfully'
      );
    } catch (error) {
      logger.error('Error updating check-out', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a check-out record by ID
   * @route DELETE /api/v1/checkouts/:id
   */
  async deleteCheckOut(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checkOut = await CheckOutModel.findByIdAndDelete(id);

      if (!checkOut) {
        logger.error('Check-out not found', { id });
        return ResponseUtil.error(res, 'Check-out not found', 404);
      }

      logger.info('Check-out deleted successfully', { checkOutId: id });
      return ResponseUtil.success(
        res,
        checkOut,
        'Check-out deleted successfully'
      );
    } catch (error) {
      logger.error('Error deleting check-out', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Complete check-out process
   * @route POST /api/v1/checkouts/:id/complete
   */
  async completeCheckOut(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const completionData = req.body;

      const checkOut = await CheckOutModel.findById(id);
      if (!checkOut) {
        logger.error('Check-out not found', { id });
        return ResponseUtil.error(res, 'Check-out not found', 404);
      }

      // Update check-out with completion data
      const updatedCheckOut = await CheckOutModel.findByIdAndUpdate(
        id,
        {
          ...completionData,
          checkOutTime: completionData.checkOutTime || new Date(),
          status: 'completed',
        },
        { new: true, runValidators: true }
      )
        .populate('checkInId', 'checkInTime assignedRoomNumber')
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone');

      // Update the corresponding check-in record
      await CheckInModel.findByIdAndUpdate(checkOut.checkInId, {
        checkOutTime: completionData.checkOutTime || new Date(),
      });

      logger.info('Check-out completed successfully', { checkOutId: id });
      return ResponseUtil.success(
        res,
        updatedCheckOut,
        'Check-out completed successfully'
      );
    } catch (error) {
      logger.error('Error completing check-out', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Process late fee for check-out
   * @route POST /api/v1/checkouts/:id/late-fee
   */
  async processLateFee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { lateFeeAmount, reason } = req.body;

      const checkOut = await CheckOutModel.findById(id);
      if (!checkOut) {
        logger.error('Check-out not found', { id });
        return ResponseUtil.error(res, 'Check-out not found', 404);
      }

      // Calculate new final bill amount including late fee
      const newFinalBillAmount = checkOut.finalBillAmount + lateFeeAmount;

      const updatedCheckOut = await CheckOutModel.findByIdAndUpdate(
        id,
        {
          finalBillAmount: newFinalBillAmount,
          lateFee: {
            amount: lateFeeAmount,
            reason: reason || 'Late check-out fee',
            appliedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      )
        .populate('checkInId', 'checkInTime assignedRoomNumber')
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone');

      logger.info('Late fee processed successfully', {
        checkOutId: id,
        lateFeeAmount,
        newFinalBillAmount,
      });
      return ResponseUtil.success(
        res,
        updatedCheckOut,
        'Late fee processed successfully'
      );
    } catch (error) {
      logger.error('Error processing late fee', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get check-out statistics
   * @route GET /api/v1/checkouts/stats
   */
  async getCheckOutStats(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const [
        totalCheckOuts,
        todayCheckOuts,
        pendingCheckOuts,
        completedCheckOuts,
        averageRating,
      ] = await Promise.all([
        CheckOutModel.countDocuments(),
        CheckOutModel.countDocuments({
          checkOutTime: { $gte: startOfDay, $lte: endOfDay },
        }),
        CheckOutModel.countDocuments({ status: 'pending' }),
        CheckOutModel.countDocuments({ status: 'completed' }),
        CheckOutModel.aggregate([
          { $match: { rating: { $exists: true, $ne: null } } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]),
      ]);

      const stats = {
        totalCheckOuts,
        todayCheckOuts,
        pendingCheckOuts,
        completedCheckOuts,
        averageRating: averageRating[0]?.avgRating || 0,
      };

      logger.info('Check-out statistics fetched successfully', { stats });
      return ResponseUtil.success(
        res,
        stats,
        'Check-out statistics fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting check-out statistics', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get pending check-outs (due for check-out today)
   * @route GET /api/v1/checkouts/pending
   */
  async getPendingCheckOuts(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const pendingCheckOuts = await CheckOutModel.find({
        status: 'pending',
        $or: [
          { checkOutTime: { $gte: startOfDay, $lte: endOfDay } },
          { checkOutTime: { $lt: startOfDay } }, // Overdue
        ],
      })
        .populate('checkInId', 'checkInTime assignedRoomNumber')
        .populate('reservationId', 'guestName checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('guestId', 'firstName lastName email phone')
        .sort({ checkOutTime: 1 });

      logger.info('Pending check-outs fetched successfully', {
        count: pendingCheckOuts.length,
      });
      return ResponseUtil.success(
        res,
        pendingCheckOuts,
        'Pending check-outs fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting pending check-outs', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
