import { Response, NextFunction } from 'express';
import { AuditLog } from '../../models/AuditLog';
import { AuthenticatedRequest } from '../../types';

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, resourceType, userEmail, limit = '50' } = req.query;
    const query: any = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: 'i' };

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10));

    res.status(200).json({ success: true, data: { logs } });
  } catch (error) {
    next(error);
  }
}
