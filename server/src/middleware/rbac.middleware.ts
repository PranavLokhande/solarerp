import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { AppError } from './error.middleware';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User authentication context missing', 401));
    }

    // Super Admin and Company Owner / Director have universal access
    if (req.user.role === 'Super Admin' || req.user.role === 'Company Owner / Director') {
      return next();
    }

    // Auditor can only perform read actions (GET, HEAD, OPTIONS)
    if (req.user.role === 'Auditor / Read-only Analyst') {
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }
      return next(new AppError('Auditor role is strictly read-only', 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized for this action.`,
          403
        )
      );
    }

    next();
  };
}

export function customerResourceGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // If internal staff, allow through
  if (req.user.role !== 'Customer') {
    return next();
  }

  // Customer must have a customerId and cannot query across different customers
  const targetCustomerId = req.params.customerId || req.query.customerId || req.body.customerId;
  if (targetCustomerId && targetCustomerId !== req.user.customerId) {
    return next(new AppError('Access denied: You can only access your own customer records', 403));
  }

  next();
}
