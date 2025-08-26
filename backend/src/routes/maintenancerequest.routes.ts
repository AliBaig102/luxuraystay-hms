import { Router } from 'express';
import { MaintenanceRequestController } from '../controllers/maintenancerequest.controller';
import { validate } from '../middleware/validation.middleware';
import { maintenanceValidationSchemas } from '../validations/maintenance.validation';

const router: Router = Router();

// CRUD Routes

/**
 * @route POST /api/maintenance-requests
 * @desc Create a new maintenance request
 * @access Private
 */
router.post(
  '/',
  validate({ body: maintenanceValidationSchemas.maintenanceRequest }),
  (req, res) => {
    void MaintenanceRequestController.create(req, res);
  }
);

/**
 * @route GET /api/maintenance-requests
 * @desc Get all maintenance requests with pagination
 * @access Private
 */
router.get('/', (req, res) => {
  void MaintenanceRequestController.getAll(req, res);
});

/**
 * @route GET /api/maintenance-requests/search
 * @desc Search maintenance requests with advanced filtering
 * @access Private
 */
router.get(
  '/search',
  validate({ query: maintenanceValidationSchemas.maintenanceRequestSearch }),
  (req, res) => {
    void MaintenanceRequestController.search(req, res);
  }
);

/**
 * @route GET /api/maintenance-requests/statistics
 * @desc Get maintenance request statistics
 * @access Private
 */
router.get('/statistics', (req, res) => {
  void MaintenanceRequestController.getStatistics(req, res);
});

/**
 * @route GET /api/maintenance-requests/:id
 * @desc Get maintenance request by ID
 * @access Private
 */
router.get('/:id', (req, res) => {
  void MaintenanceRequestController.getById(req, res);
});

/**
 * @route PUT /api/maintenance-requests/:id
 * @desc Update maintenance request
 * @access Private
 */
router.put(
  '/:id',
  validate({ body: maintenanceValidationSchemas.maintenanceRequestUpdate }),
  (req, res) => {
    void MaintenanceRequestController.update(req, res);
  }
);

/**
 * @route DELETE /api/maintenance-requests/:id
 * @desc Delete maintenance request
 * @access Private
 */
router.delete('/:id', (req, res) => {
  void MaintenanceRequestController.delete(req, res);
});

// Management Routes

/**
 * @route PUT /api/maintenance-requests/:id/assign
 * @desc Assign technician to maintenance request
 * @access Private
 */
router.put(
  '/:id/assign',
  validate({ body: maintenanceValidationSchemas.maintenanceAssignment }),
  (req, res) => {
    void MaintenanceRequestController.assignTechnician(req, res);
  }
);

/**
 * @route PUT /api/maintenance-requests/:id/status
 * @desc Update maintenance request status
 * @access Private
 */
router.put(
  '/:id/status',
  validate({ body: maintenanceValidationSchemas.maintenanceStatusUpdate }),
  (req, res) => {
    void MaintenanceRequestController.updateStatus(req, res);
  }
);

/**
 * @route PUT /api/maintenance-requests/:id/complete
 * @desc Complete maintenance request
 * @access Private
 */
router.put(
  '/:id/complete',
  validate({ body: maintenanceValidationSchemas.maintenanceCompletion }),
  (req, res) => {
    void MaintenanceRequestController.complete(req, res);
  }
);

export { router as maintenanceRequestRoutes };
