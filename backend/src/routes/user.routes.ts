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

/**
 * @route   POST /api/v1/users/register
 * @desc    Register a new user
 * @access  Public
 * @body    firstName, lastName, email, password, role
 */
router.post(
  '/register',
  asyncHandler(userController.register.bind(userController))
);
/**
 * @route   POST /api/v1/users/login
 * @desc    Login a user
 * @access  Public
 * @body    email, password
 */
router.post('/login', asyncHandler(userController.login.bind(userController)));
/**
 * @route   POST /api/v1/users/forgot-password
 * @desc    Forgot password
 * @access  Public
 * @body    email
 */
router.post(
  '/forgot-password',
  asyncHandler(userController.forgotPassword.bind(userController))
);
/**
 * @route   POST /api/v1/users/reset-password
 * @desc    Reset password
 * @access  Public
 * @body    token, password
 */
router.post(
  '/reset-password',
  asyncHandler(userController.resetPassword.bind(userController))
);
/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get('/', asyncHandler(userController.getAllUsers.bind(userController)));
/**
 * @route   GET /api/v1/users/search
 * @desc    Search users
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get(
  '/search',
  asyncHandler(userController.searchUsers.bind(userController))
);
/**
 * @route   GET /api/v1/users/role/:role
 * @desc    Get users by role
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get(
  '/role/:role',
  asyncHandler(userController.getUsersByRole.bind(userController))
);
/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get(
  '/:id',
  asyncHandler(userController.getUserById.bind(userController))
);
/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.put(
  '/:id',
  asyncHandler(userController.updateUser.bind(userController))
);
/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.delete(
  '/:id',
  asyncHandler(userController.deleteUser.bind(userController))
);
/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Toggle user status
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.patch(
  '/:id/status',
  asyncHandler(userController.toggleUserStatus.bind(userController))
);
/**
 * @route   PATCH /api/v1/users/:id/change-password
 * @desc    Change user password
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.patch(
  '/:id/change-password',
  asyncHandler(userController.changePassword.bind(userController))
);
/**
 * @route   GET /api/v1/users/:id/profile
 * @desc    Get user profile
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get(
  '/:id/profile',
  asyncHandler(userController.getUserProfile.bind(userController))
);

export const userRoutes = router;
