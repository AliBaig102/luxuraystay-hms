import { Router } from 'express';
import { ServiceRequestController } from '../controllers/servicerequest.controller';
import { validate } from '../middleware';
import { serviceRequestValidationSchemas } from '../validations/serviceRequest.validation';

const router: Router = Router();
const serviceRequestController = new ServiceRequestController();

// GET routes
router.get(
  '/',
  validate(serviceRequestValidationSchemas.serviceRequestFilter),
  (req, res) => {
    void serviceRequestController.getAllServiceRequests(req, res);
  }
);

router.get('/statistics', (req, res) => {
  void serviceRequestController.getServiceRequestStatistics(req, res);
});

router.get('/overdue', (req, res) => {
  void serviceRequestController.getOverdueServiceRequests(req, res);
});

router.get('/guest/:guestId', (req, res) => {
  void serviceRequestController.getServiceRequestsByGuest(req, res);
});

router.get('/room/:roomId', (req, res) => {
  void serviceRequestController.getServiceRequestsByRoom(req, res);
});

router.get('/staff/:staffId', (req, res) => {
  void serviceRequestController.getServiceRequestsByStaff(req, res);
});

router.get('/:id', (req, res) => {
  void serviceRequestController.getServiceRequestById(req, res);
});

// POST routes
router.post(
  '/',
  validate(serviceRequestValidationSchemas.serviceRequest),
  (req, res) => {
    void serviceRequestController.createServiceRequest(req, res);
  }
);

router.post(
  '/:id/assign',
  validate(serviceRequestValidationSchemas.serviceRequestAssignment),
  (req, res) => {
    void serviceRequestController.assignServiceRequest(req, res);
  }
);

router.post(
  '/:id/complete',
  validate(serviceRequestValidationSchemas.serviceRequestCompletion),
  (req, res) => {
    void serviceRequestController.completeServiceRequest(req, res);
  }
);

// PUT routes
router.put(
  '/:id',
  validate(serviceRequestValidationSchemas.serviceRequestUpdate),
  (req, res) => {
    void serviceRequestController.updateServiceRequest(req, res);
  }
);

// PATCH routes
router.patch(
  '/:id/status',
  validate(serviceRequestValidationSchemas.serviceRequestStatusUpdate),
  (req, res) => {
    void serviceRequestController.updateServiceRequestStatus(req, res);
  }
);

// DELETE routes
router.delete('/:id', (req, res) => {
  void serviceRequestController.deleteServiceRequest(req, res);
});

export { router as serviceRequestRoutes };
