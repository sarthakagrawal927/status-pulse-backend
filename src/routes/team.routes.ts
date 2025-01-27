import { Router } from "express";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import {
  validateInviteTeamMember,
  validateUpdateTeamMember,
  validateTeamMemberId,
} from "../middleware/validators/team.validator";
import {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMember,
} from "../controllers/team.controller";

const router = Router();

router.use(authenticate);

router.get("/", getTeamMembers);
router.post("/invite", isAdmin, validateInviteTeamMember, inviteTeamMember);
router.delete("/:id", isAdmin, validateTeamMemberId, removeTeamMember);
router.patch("/:id", isAdmin, validateUpdateTeamMember, updateTeamMember);

export default router;
