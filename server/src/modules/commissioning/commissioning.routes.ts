import { Router } from 'express';
import { recordNetMeter, commissionSystem } from './commissioning.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/net-meter',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Government Portal / DISCOM Coordinator',
    'Project Manager',
    'Quality Assurance Engineer'
  ),
  recordNetMeter
);

router.post(
  '/synchronize',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Project Manager',
    'Quality Assurance Engineer'
  ),
  commissionSystem
);

export default router;
