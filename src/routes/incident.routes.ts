import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  validateCreateIncident,
  validateUpdateIncident,
  validateIncidentId,
  validateStatusUpdate
} from '../middleware/validators/incident.validator';
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
router.get('/:id', validateIncidentId, getIncidentById);
router.post('/', isAdmin, validateCreateIncident, createIncident);
router.patch('/:id', isAdmin, validateUpdateIncident, updateIncident);
router.delete('/:id', isAdmin, validateIncidentId, deleteIncident);
router.post('/:id/updates', isAdmin, validateStatusUpdate, addStatusUpdate);

export default router;