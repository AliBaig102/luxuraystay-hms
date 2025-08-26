import { Router } from 'express';
import { BillController } from '../controllers';
import { validate } from '../middleware';
import { billValidationSchemas } from '../validations/bill.validation';

const router: Router = Router();
const billController: BillController = new BillController();

/**
 * @route   GET /api/v1/bills
 * @desc    Get all bills with pagination, search, and filtering
 * @access  Public (can be changed to protected later)
 * @query   page, limit, search, sortBy, sortOrder, status, paymentMethod, isOverdue, dateFrom, dateTo
 */
router.get('/', validate(billValidationSchemas.billFilter), (req, res) => {
  void billController.getAllBills(req, res);
});

/**
 * @route   GET /api/v1/bills/overdue
 * @desc    Get all overdue bills
 * @access  Public (can be changed to protected later)
 */
router.get('/overdue', (req, res) => {
  void billController.getOverdueBills(req, res);
});

/**
 * @route   GET /api/v1/bills/guest/:guestId
 * @desc    Get all bills for a specific guest
 * @access  Public (can be changed to protected later)
 * @param   guestId - MongoDB ObjectId of the guest
 */
router.get('/guest/:guestId', (req, res) => {
  void billController.getBillsByGuest(req, res);
});

/**
 * @route   GET /api/v1/bills/reservation/:reservationId
 * @desc    Get all bills for a specific reservation
 * @access  Public (can be changed to protected later)
 * @param   reservationId - MongoDB ObjectId of the reservation
 */
router.get('/reservation/:reservationId', (req, res) => {
  void billController.getBillsByReservation(req, res);
});

/**
 * @route   GET /api/v1/bills/:id
 * @desc    Get a single bill by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.get('/:id', (req, res) => {
  void billController.getBillById(req, res);
});

/**
 * @route   POST /api/v1/bills
 * @desc    Create a new bill
 * @access  Public (can be changed to protected later)
 * @body    reservationId, guestId, roomId, baseAmount, taxAmount, serviceCharges, additionalServices, dueDate
 */
router.post('/', validate(billValidationSchemas.bill), (req, res) => {
  void billController.createBill(req, res);
});

/**
 * @route   POST /api/v1/bills/:id/payment
 * @desc    Process payment for a bill
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    paymentMethod
 */
router.post(
  '/:id/payment',
  validate(billValidationSchemas.billPayment),
  (req, res) => {
    void billController.processPayment(req, res);
  }
);

/**
 * @route   POST /api/v1/bills/:id/refund
 * @desc    Process refund for a bill
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    refundAmount, refundReason
 */
router.post(
  '/:id/refund',
  validate(billValidationSchemas.billRefund),
  (req, res) => {
    void billController.processRefund(req, res);
  }
);

/**
 * @route   PUT /api/v1/bills/:id
 * @desc    Update a bill by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    Any bill fields to update
 */
router.put('/:id', validate(billValidationSchemas.billUpdate), (req, res) => {
  void billController.updateBill(req, res);
});

/**
 * @route   DELETE /api/v1/bills/:id
 * @desc    Delete a bill by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.delete('/:id', (req, res) => {
  void billController.deleteBill(req, res);
});

export const billRoutes = router;
