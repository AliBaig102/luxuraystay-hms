import { Router } from 'express';
import { RoomController } from '../controllers';
import { validate } from '../middleware';
import {
  roomValidationSchemas,
  getAllRoomsSchema,
} from '../validations/room.validation';

const router: Router = Router();
const roomController: RoomController = new RoomController();

/**
 * @route   GET /api/v1/rooms
 * @desc    Get all rooms with pagination, search and filters
 * @access  Public (can be changed to protected later)
 * @query   page, limit, search, sortBy, sortOrder, roomType, status, floor, minPrice, maxPrice
 */
router.get('/', validate(getAllRoomsSchema), (req, res) => {
  void roomController.getAllRooms(req, res);
});

/**
 * @route   GET /api/v1/rooms/availability
 * @desc    Check room availability
 * @access  Public (can be changed to protected later)
 * @query   checkIn, checkOut, roomType
 */
router.get(
  '/availability',
  validate(roomValidationSchemas.roomAvailability),
  (req, res) => {
    void roomController.checkAvailability(req, res);
  }
);

/**
 * @route   GET /api/v1/rooms/number/:roomNumber
 * @desc    Get a room by room number
 * @access  Public (can be changed to protected later)
 * @param   roomNumber - Room number
 */
router.get('/number/:roomNumber', (req, res) => {
  void roomController.getRoomByNumber(req, res);
});

/**
 * @route   GET /api/v1/rooms/:id
 * @desc    Get a single room by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.get('/:id', (req, res) => {
  void roomController.getRoomById(req, res);
});

/**
 * @route   POST /api/v1/rooms
 * @desc    Create a new room
 * @access  Public (can be changed to protected later)
 * @body    roomNumber, roomType, floor, capacity, pricePerNight, amenities, description, images
 */
router.post('/', validate(roomValidationSchemas.room), (req, res) => {
  void roomController.createRoom(req, res);
});

/**
 * @route   PUT /api/v1/rooms/:id
 * @desc    Update a room by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    Any room fields to update
 */
router.put(
  '/:id',
  validate(roomValidationSchemas.roomStatusUpdate),
  (req, res) => {
    void roomController.updateRoom(req, res);
  }
);

/**
 * @route   PATCH /api/v1/rooms/:id/status
 * @desc    Update room status
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    status
 */
router.patch(
  '/:id/status',
  validate(roomValidationSchemas.roomStatusUpdate),
  (req, res) => {
    void roomController.updateRoomStatus(req, res);
  }
);

/**
 * @route   DELETE /api/v1/rooms/:id
 * @desc    Delete a room by ID (soft delete)
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.delete('/:id', (req, res) => {
  void roomController.deleteRoom(req, res);
});

export const roomRoutes = router;
