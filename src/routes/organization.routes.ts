import { Router } from "express";
import { getOrganizationById } from "../controllers/organization.controller";

const router = Router();

router.get("/:organizationId", getOrganizationById);

export default router;
