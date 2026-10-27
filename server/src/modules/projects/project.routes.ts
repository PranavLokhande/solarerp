import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  updateProjectStage,
  assignProjectTeam,
} from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put(
  '/:id/stage',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Project Manager',
    'Installation Supervisor'
  ),
  updateProjectStage
);
router.put(
  '/:id/assign',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Branch Manager', 'Project Manager'),
  assignProjectTeam
);

export default router;
