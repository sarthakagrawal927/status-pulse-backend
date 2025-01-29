import { Router } from "express";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import {
  getServiceMaintenances,
  getServiceMaintenanceById,
  createServiceMaintenance,
  updateServiceMaintenance,
  deleteServiceMaintenance,
} from "../controllers/serviceMaintenance.controller";
import {
  validateCreateMaintenance,
  validateUpdateMaintenance,
  validateMaintenanceId,
} from "../middleware/validators/serviceMaintenance.validator";

const router = Router();

router.use(authenticate);

// Get all maintenances for a service
router.get("/", getServiceMaintenances);

// Get a specific maintenance
router.get("/:id", validateMaintenanceId, getServiceMaintenanceById);

// Create a new maintenance (admin only)
router.post("/", isAdmin, validateCreateMaintenance, createServiceMaintenance);

// Update a maintenance (admin only)
router.patch(
  "/:id",
  isAdmin,
  validateMaintenanceId,
  validateUpdateMaintenance,
  updateServiceMaintenance
);

// Delete a maintenance (admin only)
router.delete("/:id", isAdmin, validateMaintenanceId, deleteServiceMaintenance);

export default router;
