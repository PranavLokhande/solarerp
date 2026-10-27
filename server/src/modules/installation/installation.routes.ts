import { Router } from 'express';
import {
  getInstallationRecords,
  updateInstallationStage,
  recordQualityInspection,
} from './installation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/:projectId', getInstallationRecords);
router.post(
  '/stage-complete',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Project Manager',
    'Installation Supervisor',
    'Installation Technician'
  ),
  updateInstallationStage
);
router.post(
  '/inspect',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Quality Assurance Engineer',
    'Project Manager'
  ),
  recordQualityInspection
);

export default router;
