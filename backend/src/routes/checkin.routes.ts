import { Router } from 'express';
import { CheckInController } from '../controllers';
import { validate } from '../middleware';
import { checkInValidationSchemas } from '../validations/checkIn.validation';

const router: Router = Router();
const checkInController: CheckInController = new CheckInController();

/**
 * @route   GET /api/v1/checkins
 * @desc    Get all check-in records with pagination, search, and filtering
 * @access  Public (can be changed to protected later)
 * @query   page, limit, search, sortBy, sortOrder, status, roomId, guestId, dateFrom, dateTo
 */
router.get(
  '/',
  validate({ query: checkInValidationSchemas.checkInSearch }),
  (req, res) => {
    void checkInController.getAllCheckIns(req, res);
  }
);

/**
 * @route   GET /api/v1/checkins/stats
 * @desc    Get check-in statistics
 * @access  Public (can be changed to protected later)
 */
router.get('/stats', (req, res) => {
  void checkInController.getCheckInStats(req, res);
});

/**
 * @route   GET /api/v1/checkins/active
 * @desc    Get active check-ins (checked in but not checked out)
 * @access  Public (can be changed to protected later)
 */
router.get('/active', (req, res) => {
  void checkInController.getActiveCheckIns(req, res);
});

/**
 * @route   GET /api/v1/checkins/:id
 * @desc    Get a single check-in record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.get(
  '/:id',
  validate(checkInValidationSchemas.checkInFilter),
  (req, res) => {
    void checkInController.getCheckInById(req, res);
  }
);

/**
 * @route   POST /api/v1/checkins
 * @desc    Create a new check-in record
 * @access  Public (can be changed to protected later)
 * @body    reservationId, roomId, guestId, assignedRoomNumber, specialInstructions
 */
router.post('/', validate(checkInValidationSchemas.checkIn), (req, res) => {
  void checkInController.createCheckIn(req, res);
});

/**
 * @route   POST /api/v1/checkins/:id/complete
 * @desc    Complete check-in process
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    checkInTime, keyIssued, welcomePackDelivered, specialInstructions
 */
router.post(
  '/:id/complete',
  validate(checkInValidationSchemas.checkInCompletion),
  (req, res) => {
    void checkInController.completeCheckIn(req, res);
  }
);

/**
 * @route   PUT /api/v1/checkins/:id
 * @desc    Update a check-in record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    assignedRoomNumber?, checkInTime?, keyIssued?, welcomePackDelivered?, specialInstructions?
 */
router.put(
  '/:id',
  validate(checkInValidationSchemas.checkInUpdate),
  (req, res) => {
    void checkInController.updateCheckIn(req, res);
  }
);

/**
 * @route   DELETE /api/v1/checkins/:id
 * @desc    Delete a check-in record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.delete(
  '/:id',
  validate(checkInValidationSchemas.checkInFilter),
  (req, res) => {
    void checkInController.deleteCheckIn(req, res);
  }
);

export const checkInRoutes = router;
