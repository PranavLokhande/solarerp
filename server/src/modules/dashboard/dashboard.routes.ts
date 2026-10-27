import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);

export default router;
