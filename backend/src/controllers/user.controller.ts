import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ResponseUtil } from '../utils/response';
import { UserModel } from '../models/User.model';
import { logger } from '../utils';
import {
  userValidationSchemas,
  userRoleSchema,
} from '../validations/user.validation';
import { UserRole } from '../types/models';
import { HttpStatusCode } from '../types/api';

/**
 * User Controller
 * Handles all user-related operations including authentication, CRUD, and profile management
 */
export class UserController {
  /**
   * Register a new user
   * @route POST /api/v1/users/register
   */
  async register(req: Request, res: Response) {
    try {
      const validation = userValidationSchemas.user.safeParse(req.body);
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { email, password, firstName, lastName, phone, role } =
        validation.data;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        logger.warn('User registration attempt with existing email', { email });
        return ResponseUtil.conflict(
          res,
          'User with this email already exists'
        );
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || UserRole.GUEST,
      });

      logger.info('User registered successfully', { userId: user._id, email });
      return ResponseUtil.success(
        res,
        {
          user,
        },
        'User registered successfully',
        HttpStatusCode.CREATED
      );
    } catch (error) {
      logger.error('Error registering user', { error });
      return ResponseUtil.internalError(res, 'Failed to register user');
    }
  }

  /**
   * User login
   * @route POST /api/v1/users/login
   */
  async login(req: Request, res: Response) {
    try {
      const validation = userValidationSchemas.userLogin.safeParse(req.body);
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { email, password } = validation.data;

      // Find user by email
      const user = await UserModel.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('Login attempt with non-existent email', { email });
        return ResponseUtil.error(
          res,
          'Invalid email or password',
          HttpStatusCode.BAD_REQUEST,
          [
            {
              field: 'email',
              message: 'Invalid email or password',
            },
          ]
        );
      }

      // Check if user is active
      if (!user.isActive) {
        logger.warn('Login attempt with inactive account', { email });
        return ResponseUtil.forbidden(res, 'Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { email });
        return ResponseUtil.error(
          res,
          'Invalid email or password',
          HttpStatusCode.UNAUTHORIZED,
          [
            {
              field: 'email',
              message: 'Invalid email or password',
            },
          ]
        );
      }

      // Update last login
      await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      logger.info('User logged in successfully', { userId: user._id, email });
      return ResponseUtil.success(
        res,
        {
          token,
          user,
        },
        'Login successful'
      );
    } catch (error) {
      logger.error('Error during login', { error });
      return ResponseUtil.internalError(res, 'Login failed');
    }
  }

  /**
   * Get all users with filtering and pagination
   * @route GET /api/v1/users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const queryData = {
        role: req.query.role as string,
        isActive:
          req.query.isActive === 'true'
            ? true
            : req.query.isActive === 'false'
              ? false
              : undefined,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as string) || 'desc',
      };

      const validation = userValidationSchemas.userFilter.safeParse(queryData);
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const {
        role,
        isActive,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        sortOrder,
      } = validation.data;

      // Build filter query
      const filterQuery: any = {};
      if (role) filterQuery.role = role;
      if (isActive !== undefined) filterQuery.isActive = isActive;
      if (startDate || endDate) {
        filterQuery.createdAt = {};
        if (startDate) filterQuery.createdAt.$gte = startDate;
        if (endDate) filterQuery.createdAt.$lte = endDate;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [users, totalCount] = await Promise.all([
        UserModel.find(filterQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean(),
        UserModel.countDocuments(filterQuery),
      ]);

      logger.info('Users fetched successfully', {
        count: users.length,
        totalCount,
      });
      return ResponseUtil.paginated(
        res,
        users,
        totalCount,
        page,
        limit,
        'Users retrieved successfully'
      );
    } catch (error) {
      logger.error('Error getting all users', { error });
      return ResponseUtil.internalError(res, 'Failed to retrieve users');
    }
  }

  /**
   * Search users
   * @route GET /api/v1/users/search
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const queryData = {
        query: req.query.query as string,
        role: req.query.role as string,
        isActive:
          req.query.isActive === 'true'
            ? true
            : req.query.isActive === 'false'
              ? false
              : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as string) || 'desc',
      };

      const validation = userValidationSchemas.userSearch.safeParse(queryData);
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { query, role, isActive, page, limit, sortBy, sortOrder } =
        validation.data;

      // Build search query
      const searchQuery: any = {
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ],
      };

      if (role) searchQuery.role = role;
      if (isActive !== undefined) searchQuery.isActive = isActive;

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [users, totalCount] = await Promise.all([
        UserModel.find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean(),
        UserModel.countDocuments(searchQuery),
      ]);

      logger.info('User search completed', {
        query,
        count: users.length,
        totalCount,
      });
      return ResponseUtil.paginated(
        res,
        users,
        totalCount,
        page,
        limit,
        'Search results retrieved successfully'
      );
    } catch (error) {
      logger.error('Error searching users', { error });
      return ResponseUtil.internalError(res, 'Search failed');
    }
  }

  /**
   * Get user by ID
   * @route GET /api/v1/users/:id
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id).select('-password');
      if (!user) {
        logger.warn('User not found', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      logger.info('User fetched successfully', { userId: id });
      return ResponseUtil.success(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Error getting user by ID', {
        error,
        userId: req.params.id,
      });
      return ResponseUtil.internalError(res, 'Failed to retrieve user');
    }
  }

  /**
   * Update user
   * @route PUT /api/v1/users/:id
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const validation = userValidationSchemas.userUpdate.safeParse(req.body);
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const updateData = validation.data;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingUser = await UserModel.findOne({
          email: updateData.email,
          _id: { $ne: id },
        });
        if (existingUser) {
          return ResponseUtil.conflict(res, 'Email already exists');
        }
      }

      const user = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!user) {
        logger.warn('User not found for update', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      logger.info('User updated successfully', { userId: id });
      return ResponseUtil.success(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Error updating user', { error, userId: req.params.id });
      return ResponseUtil.internalError(res, 'Failed to update user');
    }
  }

  /**
   * Delete user
   * @route DELETE /api/v1/users/:id
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findByIdAndDelete(id).select('-password');
      if (!user) {
        logger.warn('User not found for deletion', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      logger.info('User deleted successfully', { userId: id });
      return ResponseUtil.success(res, user, 'User deleted successfully');
    } catch (error) {
      logger.error('Error deleting user', { error, userId: req.params.id });
      return ResponseUtil.internalError(res, 'Failed to delete user');
    }
  }

  /**
   * Activate/Deactivate user
   * @route PATCH /api/v1/users/:id/status
   */
  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return ResponseUtil.badRequest(res, 'isActive must be a boolean value');
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        logger.warn('User not found for status update', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      const action = isActive ? 'activated' : 'deactivated';
      logger.info(`User ${action} successfully`, { userId: id, isActive });
      return ResponseUtil.success(res, user, `User ${action} successfully`);
    } catch (error) {
      logger.error('Error updating user status', {
        error,
        userId: req.params.id,
      });
      return ResponseUtil.internalError(res, 'Failed to update user status');
    }
  }

  /**
   * Change password
   * @route PATCH /api/v1/users/:id/change-password
   */
  async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const validation = userValidationSchemas.changePassword.safeParse(
        req.body
      );
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { currentPassword, newPassword } = validation.data;

      // Find user with password
      const user = await UserModel.findById(id).select('+password');
      if (!user) {
        logger.warn('User not found for password change', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        logger.warn('Invalid current password for password change', {
          userId: id,
        });
        return ResponseUtil.unauthorized(res, 'Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await UserModel.findByIdAndUpdate(id, { password: hashedNewPassword });

      logger.info('Password changed successfully', { userId: id });
      return ResponseUtil.success(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Error changing password', { error, userId: req.params.id });
      return ResponseUtil.internalError(res, 'Failed to change password');
    }
  }

  /**
   * Forgot password - send reset token
   * @route POST /api/v1/users/forgot-password
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const validation = userValidationSchemas.forgotPassword.safeParse(
        req.body
      );
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { email } = validation.data;

      const user = await UserModel.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        logger.warn('Password reset requested for non-existent email', {
          email,
        });
        return ResponseUtil.success(
          res,
          null,
          'If the email exists, a reset link has been sent'
        );
      }

      // Generate reset token (in production, you'd send this via email)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // In a real application, you'd store this token in the database
      // For now, we'll just log it
      logger.info('Password reset token generated', {
        userId: user._id,
        email,
        resetToken,
        expiresAt: resetTokenExpiry,
      });

      return ResponseUtil.success(
        res,
        { resetToken }, // In production, don't return the token
        'If the email exists, a reset link has been sent'
      );
    } catch (error) {
      logger.error('Error in forgot password', { error });
      return ResponseUtil.internalError(
        res,
        'Failed to process forgot password request'
      );
    }
  }

  /**
   * Reset password with token
   * @route POST /api/v1/users/reset-password
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const validation = userValidationSchemas.resetPassword.safeParse(
        req.body
      );
      if (!validation.success) {
        const validationErrors = validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }

      const { email, resetToken, newPassword } = validation.data;

      // In a real application, you'd verify the token from the database
      // For now, we'll just find the user by email and log the token
      const user = await UserModel.findOne({ email });
      if (!user) {
        logger.warn('Password reset attempt with invalid email', {
          email,
          resetToken,
        });
        return ResponseUtil.badRequest(res, 'Invalid reset token or email');
      }

      // Log the reset token for verification (in production, verify against stored token)
      logger.info('Password reset token received', {
        userId: user._id,
        resetToken,
      });

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

      logger.info('Password reset successfully', { userId: user._id, email });
      return ResponseUtil.success(res, null, 'Password reset successfully');
    } catch (error) {
      logger.error('Error resetting password', { error });
      return ResponseUtil.internalError(res, 'Failed to reset password');
    }
  }

  /**
   * Get user profile
   * @route GET /api/v1/users/:id/profile
   */
  async getUserProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id).select('-password');
      if (!user) {
        logger.warn('User not found for profile', { userId: id });
        return ResponseUtil.notFound(res, 'User not found');
      }

      // In a real application, you might have a separate UserProfile model
      // For now, we'll return the user data with additional profile fields
      const profile = user.toJSON();

      logger.info('User profile fetched successfully', { userId: id });
      return ResponseUtil.success(
        res,
        profile,
        'Profile retrieved successfully'
      );
    } catch (error) {
      logger.error('Error getting user profile', {
        error,
        userId: req.params.id,
      });
      return ResponseUtil.internalError(res, 'Failed to retrieve profile');
    }
  }

  /**
   * Get users by role
   * @route GET /api/v1/users/role/:role
   */
  async getUsersByRole(req: Request, res: Response) {
    try {
      const { role } = req.params;

      // Validate role
      const roleValidation = userRoleSchema.safeParse(role);
      if (!roleValidation.success) {
        return ResponseUtil.badRequest(res, 'Invalid role specified');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        UserModel.find({ role, isActive: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean(),
        UserModel.countDocuments({ role, isActive: true }),
      ]);

      logger.info('Users by role fetched successfully', {
        role,
        count: users.length,
      });
      return ResponseUtil.paginated(
        res,
        users,
        totalCount,
        page,
        limit,
        `${role} users retrieved successfully`
      );
    } catch (error) {
      logger.error('Error getting users by role', {
        error,
        role: req.params.role,
      });
      return ResponseUtil.internalError(
        res,
        'Failed to retrieve users by role'
      );
    }
  }
}
