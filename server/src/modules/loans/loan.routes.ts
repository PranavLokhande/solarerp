import { Router } from 'express';
import { getLoans, createLoan, updateLoanStatus } from './loan.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLoans);
router.post(
  '/',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Finance Manager',
    'Finance Executive',
    'Sales Executive'
  ),
  createLoan
);
router.put(
  '/:id/status',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Finance Manager', 'Finance Executive'),
  updateLoanStatus
);

export default router;
