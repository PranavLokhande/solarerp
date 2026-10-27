import { Router } from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  addLeadActivity,
  convertLeadToCustomer,
} from './lead.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLeads);
router.post(
  '/',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive'
  ),
  createLead
);
router.get('/:id', getLeadById);
router.put(
  '/:id',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive'
  ),
  updateLead
);
router.post('/:id/activity', addLeadActivity);
router.post(
  '/:id/convert',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive'
  ),
  convertLeadToCustomer
);

export default router;
