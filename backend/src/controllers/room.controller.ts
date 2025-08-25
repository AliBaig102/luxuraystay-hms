import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { RoomModel } from '../models/Room.model';
import { logger } from '../utils';
import { getAllRoomsSchema } from '../validations/room.validation';

/**
 * Room Controller
 * Handles all CRUD operations for Room model
 */

export class RoomController {
  /**
   * Create a new room
   * @route POST /api/v1/rooms
   */
  async createRoom(req: Request, res: Response) {
    try {
      const roomData = req.body;

      // Check if a room with the same room number already exists
      const existingRoom = await RoomModel.findOne({
        roomNumber: roomData.roomNumber,
      });
      if (existingRoom) {
        logger.error('Room already exists', {
          roomNumber: roomData.roomNumber,
        });
        return ResponseUtil.error(
          res,
          'Room with this number already exists',
          400
        );
      }

      const room = await RoomModel.create(roomData);
      logger.info('Room created successfully', { room });
      return ResponseUtil.success(res, room, 'Room created successfully');
    } catch (error) {
      logger.error('Error creating room', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all rooms
   * @route GET /api/v1/rooms
   */
  async getAllRooms(req: Request, res: Response) {
    try {
      const queryData = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 10,
        search: (req.query['search'] as string) || undefined,
        sortBy: (req.query['sortBy'] as string) || 'createdAt',
        sortOrder: (req.query['sortOrder'] as string) || 'desc',
        roomType: (req.query['roomType'] as string) || undefined,
        status: (req.query['status'] as string) || undefined,
        floor: req.query['floor']
          ? parseInt(req.query['floor'] as string)
          : undefined,
        minPrice: req.query['minPrice']
          ? parseFloat(req.query['minPrice'] as string)
          : undefined,
        maxPrice: req.query['maxPrice']
          ? parseFloat(req.query['maxPrice'] as string)
          : undefined,
      };

      const queryValidation = getAllRoomsSchema.safeParse({
        query: queryData,
      });
      if (!queryValidation.success) {
        logger.warn('Invalid query parameters for getAllRooms', {
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
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        roomType,
        status,
        floor,
        minPrice,
        maxPrice,
      } = queryValidation.data.query;

      // Build search query
      const searchQuery: any = { isActive: true };

      if (search) {
        searchQuery.$or = [
          { roomNumber: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { amenities: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      if (roomType) {
        searchQuery.roomType = roomType;
      }

      if (status) {
        searchQuery.status = status;
      }

      if (floor !== undefined) {
        searchQuery.floor = floor;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        searchQuery.pricePerNight = {};
        if (minPrice !== undefined) {
          searchQuery.pricePerNight.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          searchQuery.pricePerNight.$lte = maxPrice;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [rooms, totalCount] = await Promise.all([
        RoomModel.find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        RoomModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Rooms fetched successfully', { count: rooms.length });
      return ResponseUtil.success(
        res,
        rooms,
        'Rooms fetched successfully',
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
      logger.error('Error getting all rooms', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single room by ID
   * @route GET /api/v1/rooms/:id
   */
  async getRoomById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await RoomModel.findById(id);
      if (!room) {
        logger.error('Room not found', { id });
        return ResponseUtil.error(res, 'Room not found', 404);
      }
      logger.info('Room fetched successfully', { roomId: id });
      return ResponseUtil.success(res, room, 'Room fetched successfully');
    } catch (error) {
      logger.error('Error getting room by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a room by ID
   * @route PUT /api/v1/rooms/:id
   */
  async updateRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If updating room number, check for duplicates
      if (updateData.roomNumber) {
        const existingRoom = await RoomModel.findOne({
          roomNumber: updateData.roomNumber,
          _id: { $ne: id },
        });
        if (existingRoom) {
          logger.error('Room number already exists', {
            roomNumber: updateData.roomNumber,
          });
          return ResponseUtil.error(
            res,
            'Room with this number already exists',
            400
          );
        }
      }

      const room = await RoomModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!room) {
        logger.error('Room not found', { id });
        return ResponseUtil.error(res, 'Room not found', 404);
      }
      logger.info('Room updated successfully', { roomId: id });
      return ResponseUtil.success(res, room, 'Room updated successfully');
    } catch (error) {
      logger.error('Error updating room', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a room by ID (soft delete)
   * @route DELETE /api/v1/rooms/:id
   */
  async deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await RoomModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!room) {
        logger.error('Room not found', { id });
        return ResponseUtil.error(res, 'Room not found', 404);
      }
      logger.info('Room deleted successfully', { roomId: id });
      return ResponseUtil.success(res, room, 'Room deleted successfully');
    } catch (error) {
      logger.error('Error deleting room', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get room by room number
   * @route GET /api/v1/rooms/number/:roomNumber
   */
  async getRoomByNumber(req: Request, res: Response) {
    try {
      const { roomNumber } = req.params;
      const room = await RoomModel.findOne({ roomNumber, isActive: true });
      if (!room) {
        logger.error('Room not found', { roomNumber });
        return ResponseUtil.error(res, 'Room not found', 404);
      }
      logger.info('Room fetched successfully', { roomNumber });
      return ResponseUtil.success(res, room, 'Room fetched successfully');
    } catch (error) {
      logger.error('Error getting room by number', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update room status
   * @route PATCH /api/v1/rooms/:id/status
   */
  async updateRoomStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const room = await RoomModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!room) {
        logger.error('Room not found', { id });
        return ResponseUtil.error(res, 'Room not found', 404);
      }
      logger.info('Room status updated successfully', { roomId: id, status });
      return ResponseUtil.success(
        res,
        room,
        'Room status updated successfully'
      );
    } catch (error) {
      logger.error('Error updating room status', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Check room availability
   * @route GET /api/v1/rooms/availability
   */
  async checkAvailability(req: Request, res: Response) {
    try {
      const { checkIn, checkOut, roomType } = req.query;

      const searchQuery: any = {
        isActive: true,
        status: 'available',
      };

      if (roomType) {
        searchQuery.roomType = roomType;
      }

      const availableRooms = await RoomModel.find(searchQuery);

      logger.info('Available rooms fetched successfully', {
        count: availableRooms.length,
      });
      return ResponseUtil.success(
        res,
        availableRooms,
        'Available rooms fetched successfully',
        200,
        {
          totalAvailable: availableRooms.length,
          checkIn,
          checkOut,
          roomType,
        }
      );
    } catch (error) {
      logger.error('Error checking room availability', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
