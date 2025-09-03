import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validate } from '../middleware/validation.middleware';
import { notificationValidationSchemas } from '../validations/notification.validation';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// // Health check endpoint
// router.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Notification service is running',
//     timestamp: new Date().toISOString(),
//   });
// });

// Create notification
router.post(
  '/',
  validate({ body: notificationValidationSchemas.notification }),
  (req, res) => {
    void NotificationController.create(req, res);
  }
);

// Get all notifications with filtering
router.get(
  '/',
  validate({ query: notificationValidationSchemas.notificationFilter }),
  (req, res) => {
    void NotificationController.getAll(req, res);
  }
);

// Search notifications
router.get('/search', (req, res) => {
  void NotificationController.search(req, res);
});

// Get notification statistics
router.get('/statistics', (req, res) => {
  void NotificationController.getStatistics(req, res);
});

// Get unread count for specific recipient
router.get('/unread-count/:recipientId', (req, res) => {
  void NotificationController.getUnreadCount(req, res);
});

// Mark all notifications as read for specific recipient
router.patch(
  '/mark-all-read/:recipientId',
  // roleMiddleware(['user', 'manager', 'admin']),
  (req, res) => {
    void NotificationController.markAllAsRead(req, res);
  }
);

// Bulk operations
router.patch('/mark-as-read', (req, res) => {
  void NotificationController.markAsRead(req, res);
});
router.post('/bulk-delete', (req, res) => {
  void NotificationController.bulkDelete(req, res);
});

// Get notification by ID
router.get('/:id', (req, res) => {
  void NotificationController.getById(req, res);
});

// Update notification
router.put(
  '/:id',
  validate({ body: notificationValidationSchemas.notificationUpdate }),
  (req, res) => {
    void NotificationController.update(req, res);
  }
);

// Delete notification
router.delete('/:id', (req, res) => {
  void NotificationController.delete(req, res);
});

export default router;
