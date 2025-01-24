import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  createIncident,
  getIncidents,
  updateIncident,
  deleteIncident,
  getIncidentById,
  addStatusUpdate,
} from '../controllers/incident.controller';

const router = Router();

router.use(authenticate);

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', isAdmin, createIncident);
router.patch('/:id', isAdmin, updateIncident);
router.delete('/:id', isAdmin, deleteIncident);
router.post('/:id/updates', isAdmin, addStatusUpdate);

export default router;
