import { Response } from "express";
import { ActionType } from "@prisma/client";
import { prisma } from "../index";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createUserAction } from "./action.controller";

interface CreateUserActionParams {
  actionType: ActionType;
  userId: string;
  organizationId: string;
  serviceId: string;
  description: string;
  metadata: Record<string, any>;
}

export const getServiceMaintenances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { organizationId } = req.user!;

  try {
    const servicesWithMaintenance = await prisma.service.findMany({
      where: {
        organizationId,
      },
      select: {
        ServiceMaintenance: true,
        name: true,
        status: true,
        id: true,
        createdAt: true,
      },
    });

    res.json(servicesWithMaintenance);
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    res.status(500).json({ message: "Error fetching maintenances" });
  }
};

export const getServiceMaintenanceById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { organizationId } = req.user!;

  try {
    const maintenance = await prisma.serviceMaintenance.findFirst({
      where: {
        id,
        service: {
          organizationId,
        },
      },
      include: {
        service: true,
      },
    });

    if (!maintenance) {
      res.status(404).json({ message: "Maintenance not found" });
      return;
    }

    res.json(maintenance);
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    res.status(500).json({ message: "Error fetching maintenance" });
  }
};

export const createServiceMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { serviceId, start, end, notes } = req.body;
  const { organizationId, id: userId } = req.user!;

  try {
    // Verify service belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId,
      },
    });

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    const maintenance = await prisma.serviceMaintenance.create({
      data: {
        serviceId,
        start: new Date(start),
        end: new Date(end),
        notes,
      },
      include: {
        service: true,
      },
    });

    // Create user action
    await createUserAction(
      userId,
      organizationId,
      ActionType.MAINTENANCE_SCHEDULED,
      `Scheduled maintenance for ${service.name}`,
      {
        maintenanceId: maintenance.id,
        start,
        end,
      },
      serviceId
    );

    res.status(201).json(maintenance);
  } catch (error) {
    console.error("Error creating maintenance:", error);
    res.status(500).json({ message: "Error creating maintenance" });
  }
};

export const updateServiceMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { start, end, notes } = req.body;
  const { organizationId, id: userId } = req.user!;

  try {
    const existingMaintenance = await prisma.serviceMaintenance.findFirst({
      where: {
        id,
        service: {
          organizationId,
        },
      },
      include: {
        service: true,
      },
    });

    if (!existingMaintenance) {
      res.status(404).json({ message: "Maintenance not found" });
      return;
    }

    const maintenance = await prisma.serviceMaintenance.update({
      where: { id },
      data: {
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        notes,
      },
      include: {
        service: true,
      },
    });

    // Create user action
    await createUserAction(
      userId,
      organizationId,
      ActionType.MAINTENANCE_STARTED,
      `Updated maintenance for ${maintenance.service.name}`,
      {
        maintenanceId: maintenance.id,
        start,
        end,
      },
      maintenance.serviceId
    );

    res.json(maintenance);
  } catch (error) {
    console.error("Error updating maintenance:", error);
    res.status(500).json({ message: "Error updating maintenance" });
  }
};

export const deleteServiceMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { organizationId, id: userId } = req.user!;

  try {
    const maintenance = await prisma.serviceMaintenance.findFirst({
      where: {
        id,
        service: {
          organizationId,
        },
      },
      include: {
        service: true,
      },
    });

    if (!maintenance) {
      res.status(404).json({ message: "Maintenance not found" });
      return;
    }

    await prisma.serviceMaintenance.delete({
      where: { id },
    });

    // Create user action
    await createUserAction(
      userId,
      organizationId,
      ActionType.MAINTENANCE_COMPLETED,
      `Deleted maintenance for ${maintenance.service.name}`,
      {
        maintenanceId: maintenance.id,
      },
      maintenance.serviceId
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    res.status(500).json({ message: "Error deleting maintenance" });
  }
};
