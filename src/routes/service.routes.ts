import { Router } from "express";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import {
  validateCreateService,
  validateUpdateService,
  validateServiceId,
} from "../middleware/validators/service.validator";
import {
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceById,
} from "../controllers/service.controller";

const router = Router();

router.get("/", getServices);
router.use(authenticate);

router.get("/:id", validateServiceId, getServiceById);
router.post("/", isAdmin, validateCreateService, createService);
router.patch("/:id", isAdmin, validateUpdateService, updateService);
router.delete("/:id", isAdmin, validateServiceId, deleteService);

export default router;
