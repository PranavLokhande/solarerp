import { Router } from 'express';
import {
  getSurveys,
  createSurvey,
  getSurveyById,
  updateSurvey,
} from './survey.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSurveys);
router.post(
  '/',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Sales Manager',
    'Sales Executive',
    'Site Survey Engineer'
  ),
  createSurvey
);
router.get('/:id', getSurveyById);
router.put(
  '/:id',
  authorizeRoles(
    'Super Admin',
    'Company Owner / Director',
    'Branch Manager',
    'Site Survey Engineer',
    'Design Engineer'
  ),
  updateSurvey
);

export default router;
