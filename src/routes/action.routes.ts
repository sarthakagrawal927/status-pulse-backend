import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getUserActions } from "../controllers/action.controller";

const router = Router();

router.use(authenticate);

// Get all actions with optional filtering
router.get("/", getUserActions);

export default router;
