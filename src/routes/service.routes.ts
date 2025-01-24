import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceById,
} from '../controllers/service.controller';

const router = Router();

router.use(authenticate);

// Updated route handlers to not return the response
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', isAdmin, createService);
router.patch('/:id', isAdmin, updateService);
router.delete('/:id', isAdmin, deleteService);

export default router;
