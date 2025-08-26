import { Request, Response, Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { validate } from '../middleware/validation.middleware';
import { feedbackValidationSchemas } from '../validations/feedback.validation';

const router: Router = Router();

// Create feedback
router.post(
  '/',
  validate(feedbackValidationSchemas.feedback),
  (req: Request, res: Response) => {
    void FeedbackController.create(req, res);
  }
);

// Get all feedback with filtering
router.get('/', (req: Request, res: Response) => {
  void FeedbackController.getAll(req, res);
});

// Search feedback
router.get('/search', (req: Request, res: Response) => {
  void FeedbackController.search(req, res);
});

// Get feedback statistics
router.get('/statistics', (req: Request, res: Response) => {
  void FeedbackController.getStatistics(req, res);
});

// Get feedback by ID
router.get('/:id', (req: Request, res: Response) => {
  void FeedbackController.getById(req, res);
});

// Update feedback
router.put(
  '/:id',
  validate(feedbackValidationSchemas.feedbackUpdate),
  (req: Request, res: Response) => {
    void FeedbackController.update(req, res);
  }
);

// Delete feedback
router.delete('/:id', (req: Request, res: Response) => {
  void FeedbackController.delete(req, res);
});

// Add response to feedback
router.post(
  '/:id/respond',
  validate(feedbackValidationSchemas.feedbackResponse),
  (req: Request, res: Response) => {
    void FeedbackController.addResponse(req, res);
  }
);

export { router as feedbackRoutes };
