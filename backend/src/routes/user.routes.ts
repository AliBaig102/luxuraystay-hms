import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';

const router: Router = Router();
const userController = new UserController();

// Async handler wrapper to catch errors
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Authentication routes
router.post(
  '/register',
  asyncHandler(userController.register.bind(userController))
);
router.post('/login', asyncHandler(userController.login.bind(userController)));

// Password management routes
router.post(
  '/forgot-password',
  asyncHandler(userController.forgotPassword.bind(userController))
);
router.post(
  '/reset-password',
  asyncHandler(userController.resetPassword.bind(userController))
);

// User CRUD routes
router.get('/', asyncHandler(userController.getAllUsers.bind(userController)));
router.get(
  '/search',
  asyncHandler(userController.searchUsers.bind(userController))
);
router.get(
  '/role/:role',
  asyncHandler(userController.getUsersByRole.bind(userController))
);
router.get(
  '/:id',
  asyncHandler(userController.getUserById.bind(userController))
);
router.put(
  '/:id',
  asyncHandler(userController.updateUser.bind(userController))
);
router.delete(
  '/:id',
  asyncHandler(userController.deleteUser.bind(userController))
);

// User status and profile routes
router.patch(
  '/:id/status',
  asyncHandler(userController.toggleUserStatus.bind(userController))
);
router.patch(
  '/:id/change-password',
  asyncHandler(userController.changePassword.bind(userController))
);
router.get(
  '/:id/profile',
  asyncHandler(userController.getUserProfile.bind(userController))
);

export const userRoutes=router;
