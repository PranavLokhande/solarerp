import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  verifyDocument,
  initiateNameCorrection,
} from './document.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/upload', uploadDocument);
router.put(
  '/:id/verify',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Documentation Executive',
    'Government Portal / DISCOM Coordinator',
    'Project Manager'
  ),
  verifyDocument
);
router.post(
  '/name-correction',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Documentation Executive',
    'Government Portal / DISCOM Coordinator'
  ),
  initiateNameCorrection
);

export default router;
