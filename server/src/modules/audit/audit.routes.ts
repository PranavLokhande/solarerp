import { Router } from 'express';
import { getAuditLogs } from './audit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/logs',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Auditor / Read-only Analyst'),
  getAuditLogs
);

export default router;
