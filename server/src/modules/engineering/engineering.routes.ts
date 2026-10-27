import { Router } from 'express';
import { getDesigns, createDesign, getDesignById } from './engineering.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDesigns);
router.post(
  '/',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Design Engineer', 'Project Manager'),
  createDesign
);
router.get('/:id', getDesignById);

export default router;
