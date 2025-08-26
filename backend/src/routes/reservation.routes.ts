import { Router, type Router as ExpressRouter } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { validate } from '../middleware';
import { reservationValidationSchemas } from '../validations/reservation.validation';

const router: ExpressRouter = Router();

// GET /api/reservations - Get all reservations with pagination, search, and filters
router.get(
  '/',
  validate(reservationValidationSchemas.reservationFilter),
  (req, res) => {
    void ReservationController.getAllReservations(req, res);
  }
);

// GET /api/reservations/availability - Check room availability
router.get(
  '/availability',
  validate(reservationValidationSchemas.reservationAvailability),
  (req, res) => {
    void ReservationController.checkAvailability(req, res);
  }
);

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', (req, res) => {
  void ReservationController.getReservationById(req, res);
});

// POST /api/reservations - Create new reservation
router.post(
  '/',
  validate(reservationValidationSchemas.reservation),
  (req, res) => {
    void ReservationController.createReservation(req, res);
  }
);

// PUT /api/reservations/:id - Update reservation
router.put(
  '/:id',
  validate(reservationValidationSchemas.reservationUpdate),
  (req, res) => {
    void ReservationController.updateReservation(req, res);
  }
);

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', (req, res) => {
  void ReservationController.updateReservationStatus(req, res);
});

// PATCH /api/reservations/:id/confirm - Confirm reservation
router.patch(
  '/:id/confirm',
  validate(reservationValidationSchemas.reservationConfirmation),
  (req, res) => {
    void ReservationController.confirmReservation(req, res);
  }
);

// PATCH /api/reservations/:id/cancel - Cancel reservation
router.patch(
  '/:id/cancel',
  validate(reservationValidationSchemas.reservationCancellation),
  (req, res) => {
    void ReservationController.cancelReservation(req, res);
  }
);

// PATCH /api/reservations/:id/cancel - Cancel reservation
router.patch(
  '/:id/cancel',
  validate(reservationValidationSchemas.reservationCancellation),
  (req, res) => {
    void ReservationController.cancelReservation(req, res);
  }
);

// DELETE /api/reservations/:id - Soft delete reservation
router.delete(
  '/:id',
  validate(reservationValidationSchemas.deleteReservation),
  (req, res) => {
    void ReservationController.deleteReservation(req, res);
  }
);

export { router as reservationRoutes };
