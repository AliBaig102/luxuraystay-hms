import { Router } from 'express';
import { HousekeepingTaskController } from '../controllers/housekeepingtask.controller';
import { validate } from '../middleware';
import { housekeepingValidationSchemas } from '../validations/housekeeping.validation';

const router: Router = Router();
const housekeepingTaskController = new HousekeepingTaskController();

// GET routes
router.get(
  '/',
  validate(housekeepingValidationSchemas.housekeepingTaskFilter),
  (req, res) => {
    void housekeepingTaskController.getAllHousekeepingTasks(req, res);
  }
);

router.get('/statistics', (req, res) => {
  void housekeepingTaskController.getHousekeepingTaskStatistics(req, res);
});

router.get('/overdue', (req, res) => {
  void housekeepingTaskController.getOverdueHousekeepingTasks(req, res);
});

router.get('/room/:roomId', (req, res) => {
  void housekeepingTaskController.getHousekeepingTasksByRoom(req, res);
});

router.get('/staff/:staffId', (req, res) => {
  void housekeepingTaskController.getHousekeepingTasksByStaff(req, res);
});

router.get('/:id', (req, res) => {
  void housekeepingTaskController.getHousekeepingTaskById(req, res);
});

// POST routes
router.post(
  '/',
  validate(housekeepingValidationSchemas.housekeepingTask),
  (req, res) => {
    void housekeepingTaskController.createHousekeepingTask(req, res);
  }
);

router.post(
  '/:id/assign',
  validate(housekeepingValidationSchemas.taskAssignment),
  (req, res) => {
    void housekeepingTaskController.assignHousekeepingTask(req, res);
  }
);

router.post(
  '/:id/complete',
  validate(housekeepingValidationSchemas.taskCompletion),
  (req, res) => {
    void housekeepingTaskController.completeHousekeepingTask(req, res);
  }
);

// PUT routes
router.put(
  '/:id',
  validate(housekeepingValidationSchemas.housekeepingTaskUpdate),
  (req, res) => {
    void housekeepingTaskController.updateHousekeepingTask(req, res);
  }
);

// PATCH routes
router.patch(
  '/:id/status',
  validate(housekeepingValidationSchemas.taskStatusUpdate),
  (req, res) => {
    void housekeepingTaskController.updateHousekeepingTaskStatus(req, res);
  }
);

// DELETE routes
router.delete('/:id', (req, res) => {
  void housekeepingTaskController.deleteHousekeepingTask(req, res);
});

export { router as housekeepingTaskRoutes };
