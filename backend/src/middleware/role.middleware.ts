import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import { UserRole } from '../types/models';

/**
 * Role-based access control middleware
 * Checks if authenticated user has required role(s)
 */

// Create a custom Request type that includes the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const roleMiddleware = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Check if user is authenticated (should be set by authMiddleware)
      if (!req.user) {
        ResponseUtil.error(res, 'Authentication required', 401);
        return;
      }

      const userRole = req.user.role;

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(userRole)) {
        logger.warn('Access denied - insufficient permissions', {
          userId: req.user.id,
          userRole,
          allowedRoles,
          path: req.path,
          method: req.method,
        });

        ResponseUtil.error(
          res,
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          403
        );
        return;
      }

      // User has required role, continue to next middleware
      next();
    } catch (error: any) {
      logger.error('Role middleware error', {
        error: error.message,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
      });

      ResponseUtil.error(res, 'Authorization check failed', 500);
    }
  };
};

/**
 * Admin-only middleware
 * Shorthand for requiring admin role
 */
export const adminOnly = roleMiddleware(['admin']);

/**
 * Manager or Admin middleware
 * Shorthand for requiring manager or admin role
 */
export const managerOrAdmin = roleMiddleware(['manager', 'admin']);

/**
 * Staff or higher middleware
 * Shorthand for requiring staff, manager, or admin role
 */
export const staffOrHigher = roleMiddleware(['staff', 'manager', 'admin']);

/**
 * Resource owner or admin middleware
 * Checks if user owns the resource or is an admin
 */
export const ownerOrAdmin = (resourceUserIdField = 'userId') => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Authentication required', 401);
        return;
      }

      const userRole = req.user.role;
      const userId = req.user.id;

      // Admin can access any resource
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (userRole === UserRole.ADMIN) {
        next();
        return;
      }

      // Check if user owns the resource
      const resourceUserId =
        req.params[resourceUserIdField] || req.body[resourceUserIdField];

      if (resourceUserId && resourceUserId === userId) {
        next();
        return;
      }

      // User doesn't own the resource and is not admin
      ResponseUtil.error(
        res,
        'Access denied. You can only access your own resources.',
        403
      );
    } catch (error: any) {
      logger.error('Owner or admin middleware error', {
        error: error.message,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
      });

      ResponseUtil.error(res, 'Authorization check failed', 500);
    }
  };
};
