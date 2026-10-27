import { Router } from 'express';
import {
  getApplications,
  createApplication,
  updateApplicationStage,
} from './regulatory.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.post(
  '/',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Government Portal / DISCOM Coordinator',
    'Documentation Executive',
    'Project Manager'
  ),
  createApplication
);
router.put(
  '/:id/stage',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Government Portal / DISCOM Coordinator',
    'Documentation Executive',
    'Project Manager'
  ),
  updateApplicationStage
);

export default router;
