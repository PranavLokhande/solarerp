import { Router } from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  getBranches,
  getDepartments,
} from './employee.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('Super Admin', 'Company Owner / Director', 'Branch Manager', 'HR Manager'), getEmployees);
router.post('/invite', authorizeRoles('Super Admin', 'Company Owner / Director', 'HR Manager'), createEmployee);
router.put('/:id', authorizeRoles('Super Admin', 'Company Owner / Director', 'HR Manager'), updateEmployee);

router.get('/branches', getBranches);
router.get('/departments', getDepartments);

export default router;
