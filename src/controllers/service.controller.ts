import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { IncidentStatus, ServiceStatus } from "../utils/constants";
import { createUserAction } from "./action.controller";

export const getServices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(req.user, String(req.query.organizationId) || req.user);
    const services = await prisma.service.findMany({
      where: {
        organizationId: String(req.query.organizationId) || req.organizationId,
      },
      include: {
        incidents: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            updates: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services" });
  }
};

export const getServiceById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
      include: {
        incidents: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service" });
  }
};

export const createService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description, status } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        organizationId: req.organizationId!,
        status: status || ServiceStatus.OPERATIONAL,
      },
    });

    // Create action for service creation
    await createUserAction(
      req.user.id,
      req.organizationId,
      "SERVICE_STATUS_CHANGED",
      `Created new service: ${name}`,
      { status: "OPERATIONAL" },
      service.id
    );

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Error creating service" });
  }
};

export const updateService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description, status } = req.body;

    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    const updatedService = await prisma.service.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      },
    });

    // Create action for service update
    if (status && status !== service.status) {
      let actionDescription = `Updated service status to ${status}`;

      await createUserAction(
        req.user.id,
        req.organizationId,
        "SERVICE_STATUS_CHANGED",
        actionDescription,
        { status },
        service.id
      );
    } else if (name || description) {
      await createUserAction(
        req.user.id,
        req.organizationId,
        "SERVICE_STATUS_CHANGED",
        `Updated service details for ${updatedService.name}`,
        { name, description },
        service.id
      );
    }

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Error updating service" });
  }
};

export const deleteService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    await prisma.service.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting service" });
  }
};
