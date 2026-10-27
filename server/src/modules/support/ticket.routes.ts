import { Router } from 'express';
import {
  getTickets,
  createTicket,
  resolveTicket,
  getWarranties,
  getAMCContracts,
} from './ticket.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id/resolve', resolveTicket);
router.get('/warranties', getWarranties);
router.get('/amc', getAMCContracts);

export default router;
