import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../types';

export async function logAuditEvent(
  req: AuthenticatedRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // Sanitize details: strip sensitive keys
    const sanitizedDetails: Record<string, any> = { ...details };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'aadhaar', 'pan', 'bankAccount'];
    
    for (const key of Object.keys(sanitizedDetails)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitizedDetails[key] = '[REDACTED]';
      }
    }

    const auditId = `AUD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await AuditLog.create({
      auditId,
      userId: req.user?.userId,
      userEmail: req.user?.email || 'anonymous',
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: sanitizedDetails,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
