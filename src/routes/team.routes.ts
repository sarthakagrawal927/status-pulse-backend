import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMember,
} from '../controllers/team.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTeamMembers);
router.post('/invite', isAdmin, inviteTeamMember);
router.delete('/:id', isAdmin, removeTeamMember);
router.patch('/:id', isAdmin, updateTeamMember);

export default router;
