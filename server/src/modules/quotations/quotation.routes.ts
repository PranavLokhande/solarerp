import { Router } from 'express';
import {
  getQuotations,
  createQuotation,
  approveQuotation,
  acceptQuotation,
} from './quotation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getQuotations);
router.post(
  '/',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive'
  ),
  createQuotation
);
router.put(
  '/:id/approve',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Branch Manager', 'Sales Manager'),
  approveQuotation
);
router.post(
  '/:id/accept',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive',
    'Customer'
  ),
  acceptQuotation
);

export default router;
