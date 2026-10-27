import { Router } from 'express';
import {
  getInventory,
  inwardStock,
  dispatchMaterial,
  getDispatches,
} from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getInventory);
router.post(
  '/inward',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Warehouse Manager',
    'Inventory Executive',
    'Procurement Manager'
  ),
  inwardStock
);
router.post(
  '/dispatch',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Warehouse Manager',
    'Inventory Executive',
    'Project Manager'
  ),
  dispatchMaterial
);
router.get('/dispatches', getDispatches);

export default router;
