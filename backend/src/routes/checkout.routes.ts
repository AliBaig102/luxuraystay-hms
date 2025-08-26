import { Router } from 'express';
import { CheckOutController } from '../controllers';
import { validate } from '../middleware';
import { checkOutValidationSchemas } from '../validations/checkOut.validation';

const router: Router = Router();
const checkOutController: CheckOutController = new CheckOutController();

/**
 * @route   GET /api/v1/checkouts
 * @desc    Get all check-out records with pagination, search, and filtering
 * @access  Public (can be changed to protected later)
 * @query   page, limit, search, sortBy, sortOrder, status, paymentStatus, roomId, guestId, dateFrom, dateTo
 */
router.get(
  '/',
  validate({ query: checkOutValidationSchemas.checkOutSearch }),
  (req, res) => {
    void checkOutController.getAllCheckOuts(req, res);
  }
);

/**
 * @route   GET /api/v1/checkouts/stats
 * @desc    Get check-out statistics
 * @access  Public (can be changed to protected later)
 */
router.get('/stats', (req, res) => {
  void checkOutController.getCheckOutStats(req, res);
});

/**
 * @route   GET /api/v1/checkouts/pending
 * @desc    Get pending check-outs (due for check-out today)
 * @access  Public (can be changed to protected later)
 */
router.get('/pending', (req, res) => {
  void checkOutController.getPendingCheckOuts(req, res);
});

/**
 * @route   GET /api/v1/checkouts/:id
 * @desc    Get a single check-out record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.get(
  '/:id',
  validate(checkOutValidationSchemas.checkOutFilter),
  (req, res) => {
    void checkOutController.getCheckOutById(req, res);
  }
);

/**
 * @route   POST /api/v1/checkouts
 * @desc    Create a new check-out record
 * @access  Public (can be changed to protected later)
 * @body    checkInId, finalBillAmount, paymentStatus, feedback, rating
 */
router.post('/', validate(checkOutValidationSchemas.checkOut), (req, res) => {
  void checkOutController.createCheckOut(req, res);
});

/**
 * @route   POST /api/v1/checkouts/:id/complete
 * @desc    Complete check-out process
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    checkOutTime, finalBillAmount, paymentStatus, feedback, rating
 */
router.post(
  '/:id/complete',
  validate(checkOutValidationSchemas.checkOutCompletion),
  (req, res) => {
    void checkOutController.completeCheckOut(req, res);
  }
);

/**
 * @route   POST /api/v1/checkouts/:id/late-fee
 * @desc    Process late fee for check-out
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    lateFeeAmount, reason
 */
router.post('/:id/late-fee', (req, res) => {
  void checkOutController.processLateFee(req, res);
});

/**
 * @route   PUT /api/v1/checkouts/:id
 * @desc    Update a check-out record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    checkOutTime?, finalBillAmount?, paymentStatus?, feedback?, rating?
 */
router.put(
  '/:id',
  validate(checkOutValidationSchemas.checkOutUpdate),
  (req, res) => {
    void checkOutController.updateCheckOut(req, res);
  }
);

/**
 * @route   DELETE /api/v1/checkouts/:id
 * @desc    Delete a check-out record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.delete(
  '/:id',
  validate(checkOutValidationSchemas.checkOutFilter),
  (req, res) => {
    void checkOutController.deleteCheckOut(req, res);
  }
);

export const checkOutRoutes = router;
