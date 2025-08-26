import { Request, Response } from 'express';
import { ReservationModel as Reservation } from '../models/Reservation.model';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils';
import { Types } from 'mongoose';
import { ReservationStatus } from '../types/models';

export class ReservationController {
  // Create a new reservation
  static async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationData = req.body;

      // Check if room is available for the requested dates
      const existingReservation = await Reservation.findOne({
        roomId: reservationData.roomId,
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          {
            checkInDate: { $lte: new Date(reservationData.checkOutDate) },
            checkOutDate: { $gte: new Date(reservationData.checkInDate) },
          },
        ],
      });

      if (existingReservation) {
        ResponseUtil.error(
          res,
          'Room is not available for the selected dates',
          409
        );
        return;
      }

      const reservation = new Reservation(reservationData);
      const savedReservation = await reservation.save();

      logger.info(
        `Reservation created successfully with ID: ${savedReservation._id}`
      );
      ResponseUtil.success(
        res,
        savedReservation,
        'Reservation created successfully',
        201
      );
    } catch (error: any) {
      logger.error('Error creating reservation:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to create reservation',
        500
      );
    }
  }

  // Get all reservations with pagination, search, and filters
  static async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        guestId,
        roomId,
        checkInDate,
        checkOutDate,
        source,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build search query
      const searchQuery: any = {};

      if (search) {
        searchQuery.$or = [
          { specialRequests: { $regex: search, $options: 'i' } },
          { source: { $regex: search, $options: 'i' } },
        ];
      }

      // Add filters
      if (status) searchQuery.status = status;
      if (guestId) searchQuery.guestId = new Types.ObjectId(guestId as string);
      if (roomId) searchQuery.roomId = new Types.ObjectId(roomId as string);
      if (checkInDate) {
        searchQuery.checkInDate = { $gte: new Date(checkInDate as string) };
      }
      if (checkOutDate) {
        searchQuery.checkOutDate = { $lte: new Date(checkOutDate as string) };
      }
      if (source) searchQuery.source = source;

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const reservations = await Reservation.find(searchQuery)
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price')
        .populate('assignedRoomId', 'roomNumber roomType')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Reservation.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / limitNum);

      const paginationData = {
        reservations,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      logger.info(`Retrieved ${reservations.length} reservations`);
      ResponseUtil.success(
        res,
        paginationData,
        'Reservations retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Error retrieving reservations:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to retrieve reservations',
        500
      );
    }
  }

  // Get reservation by ID
  static async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      const reservation = await Reservation.findById(id)
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price amenities')
        .populate('assignedRoomId', 'roomNumber roomType')
        .lean();

      if (!reservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      logger.info(`Retrieved reservation with ID: ${id}`);
      ResponseUtil.success(
        res,
        reservation,
        'Reservation retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Error retrieving reservation by ID:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to retrieve reservation',
        500
      );
    }
  }

  // Update reservation
  static async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      // If updating room or dates, check availability
      if (
        updateData.roomId ||
        updateData.checkInDate ||
        updateData.checkOutDate
      ) {
        const currentReservation = await Reservation.findById(id);
        if (!currentReservation) {
          ResponseUtil.error(res, 'Reservation not found', 404);
          return;
        }

        const roomId = updateData.roomId || currentReservation.roomId;
        const checkInDate =
          updateData.checkInDate || currentReservation.checkInDate;
        const checkOutDate =
          updateData.checkOutDate || currentReservation.checkOutDate;

        const conflictingReservation = await Reservation.findOne({
          _id: { $ne: id },
          roomId: roomId,
          status: { $in: ['confirmed', 'checked-in'] },
          $or: [
            {
              checkInDate: { $lte: new Date(checkOutDate) },
              checkOutDate: { $gte: new Date(checkInDate) },
            },
          ],
        });

        if (conflictingReservation) {
          ResponseUtil.error(
            res,
            'Room is not available for the selected dates',
            409
          );
          return;
        }
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price')
        .populate('assignedRoomId', 'roomNumber roomType')
        .lean();

      if (!updatedReservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      logger.info(`Updated reservation with ID: ${id}`);
      ResponseUtil.success(
        res,
        updatedReservation,
        'Reservation updated successfully'
      );
    } catch (error: any) {
      logger.error('Error updating reservation:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to update reservation',
        500
      );
    }
  }

  // Check room availability
  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, checkInDate, checkOutDate } = req.query;

      if (!roomId || !checkInDate || !checkOutDate) {
        ResponseUtil.error(
          res,
          'Room ID, check-in date, and check-out date are required',
          400
        );
        return;
      }

      const roomIdStr = roomId as string;
      if (!Types.ObjectId.isValid(roomIdStr)) {
        ResponseUtil.error(res, 'Invalid room ID format', 400);
        return;
      }

      const conflictingReservation = await Reservation.findOne({
        roomId: new Types.ObjectId(roomIdStr),
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          {
            checkInDate: { $lte: new Date(checkOutDate as string) },
            checkOutDate: { $gte: new Date(checkInDate as string) },
          },
        ],
      });

      const isAvailable = !conflictingReservation;

      logger.info(`Checked availability for room ${roomIdStr}: ${isAvailable}`);
      ResponseUtil.success(
        res,
        {
          available: isAvailable,
          roomId,
          checkInDate,
          checkOutDate,
          conflictingReservation: conflictingReservation
            ? conflictingReservation._id
            : null,
        },
        'Availability checked successfully'
      );
    } catch (error: any) {
      logger.error('Error checking availability:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to check availability',
        500
      );
    }
  }

  // Confirm reservation
  static async confirmReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      if (reservation.status !== ReservationStatus.PENDING) {
        ResponseUtil.error(
          res,
          'Only pending reservations can be confirmed',
          400
        );
        return;
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        {
          status: 'confirmed',
          confirmedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price')
        .lean();

      logger.info(`Confirmed reservation with ID: ${id}`);
      ResponseUtil.success(
        res,
        updatedReservation,
        'Reservation confirmed successfully'
      );
    } catch (error: any) {
      logger.error('Error confirming reservation:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to confirm reservation',
        500
      );
    }
  }

  // Cancel reservation
  static async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      if (['cancelled', 'checked-out'].includes(reservation.status)) {
        ResponseUtil.error(
          res,
          'Reservation is already cancelled or completed',
          400
        );
        return;
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price')
        .lean();

      logger.info(`Cancelled reservation with ID: ${id}`);
      ResponseUtil.success(
        res,
        updatedReservation,
        'Reservation cancelled successfully'
      );
    } catch (error: any) {
      logger.error('Error cancelling reservation:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to cancel reservation',
        500
      );
    }
  }

  // Update reservation status
  static async updateReservationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      const validStatuses = [
        'pending',
        'confirmed',
        'checked-in',
        'checked-out',
        'cancelled',
        'no-show',
      ];
      if (!validStatuses.includes(status)) {
        ResponseUtil.error(res, 'Invalid status value', 400);
        return;
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Add timestamp based on status
      if (status === 'confirmed') updateData.confirmedAt = new Date();
      if (status === 'checked-in') updateData.checkedInAt = new Date();
      if (status === 'checked-out') updateData.checkedOutAt = new Date();
      if (status === 'cancelled') updateData.cancelledAt = new Date();

      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType price')
        .lean();

      if (!updatedReservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      logger.info(`Updated reservation status to ${status} for ID: ${id}`);
      ResponseUtil.success(
        res,
        updatedReservation,
        'Reservation status updated successfully'
      );
    } catch (error: any) {
      logger.error('Error updating reservation status:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to update reservation status',
        500
      );
    }
  }

  // Delete reservation
  static async deleteReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { deletionReason, notes } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid reservation ID format', 400);
        return;
      }

      const reservation = await Reservation.findById(id);
      if (!reservation) {
        ResponseUtil.error(res, 'Reservation not found', 404);
        return;
      }

      // Only allow deletion of cancelled or pending reservations
      if (!['cancelled', 'pending'].includes(reservation.status)) {
        ResponseUtil.error(
          res,
          'Only cancelled or pending reservations can be deleted',
          400
        );
        return;
      }

      // Soft delete by updating isActive to false
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        {
          isActive: false,
          deletionReason,
          notes,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).lean();

      logger.info(`Deleted reservation with ID: ${id}`);
      ResponseUtil.success(
        res,
        updatedReservation,
        'Reservation deleted successfully'
      );
    } catch (error: any) {
      logger.error('Error deleting reservation:', error);
      ResponseUtil.error(
        res,
        error.message || 'Failed to delete reservation',
        500
      );
    }
  }
}
