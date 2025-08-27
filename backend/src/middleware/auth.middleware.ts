import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import { UserRole } from '../types/models';

// Extend the Request interface locally
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseUtil.error(res, 'Access token required', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      ResponseUtil.error(res, 'Server configuration error', 500);
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // Find user by ID from token
    const user = await UserModel.findById(decoded.userId).select('-password');

    if (!user) {
      ResponseUtil.error(res, 'User not found', 401);
      return;
    }

    // Check if user account is active
    if (!user.isActive) {
      ResponseUtil.error(res, 'Account is deactivated', 401);
      return;
    }

    // Attach user to request object
    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication middleware error', {
      error: error.message,
      path: req.path,
      method: req.method,
    });

    if (error.name === 'JsonWebTokenError') {
      ResponseUtil.error(res, 'Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      ResponseUtil.error(res, 'Token expired', 401);
    } else {
      ResponseUtil.error(res, 'Authentication failed', 401);
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const user = await UserModel.findById(decoded.userId).select('-password');

    if (user && user.isActive) {
      req.user = {
        id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }

    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    logger.error('Optional authentication middleware error', {
      error: error,
      path: req.path,
      method: req.method,
    });
    next();
  }
};
