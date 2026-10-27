import { Router } from 'express';
import {
  getInvoices,
  createInvoice,
  getPayments,
  recordPayment,
  getCustomerLedger,
} from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/invoices', getInvoices);
router.post(
  '/invoices',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Finance Manager', 'Finance Executive'),
  createInvoice
);
router.get('/payments', getPayments);
router.post(
  '/payments',
  authorizeRoles('Super Admin', 'Company Owner / Director', 'Finance Manager', 'Finance Executive'),
  recordPayment
);
router.get('/ledger/:customerId', getCustomerLedger);

export default router;
