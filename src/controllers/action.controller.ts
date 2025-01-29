import { Request, Response } from "express";
import { Prisma, ActionType } from "@prisma/client";
import { prisma } from "..";
import { broadcastAction } from "../services/socket.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Get all actions with pagination and filtering
export const getUserActions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      page = 1,
      limit = 40,
      actionType,
      serviceId,
      incidentId,
      organizationId,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause based on filters
    const where: Prisma.UserActionWhereInput = {
      organizationId: String(organizationId) || req.organizationId,
      // ...(serviceId && { serviceId: serviceId as string }),
      // ...(incidentId && { incidentId: incidentId as string }),
      actionType: {
        in: [
          ActionType.INCIDENT_CREATED,
          ActionType.INCIDENT_UPDATED,
          ActionType.INCIDENT_RESOLVED,
          ActionType.SERVICE_STATUS_CHANGED,
          ActionType.MAINTENANCE_SCHEDULED,
          ActionType.MAINTENANCE_STARTED,
          ActionType.MAINTENANCE_COMPLETED,
        ],
      },
    };

    const [actions, total] = await Promise.all([
      prisma.userAction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          incident: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      }),
      prisma.userAction.count({ where }),
    ]);

    res.json({
      actions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Error getting user actions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Utility function to create actions (to be used by other controllers)
export const createUserAction = async (
  userId: string,
  organizationId: string = "",
  actionType: ActionType,
  description: string,
  metadata?: any,
  serviceId?: string,
  incidentId?: string
) => {
  try {
    if (!organizationId) return;
    const action = await prisma.userAction.create({
      data: {
        actionType,
        description,
        metadata,
        userId,
        organizationId,
        ...(serviceId && { serviceId }),
        ...(incidentId && { incidentId }),
      },
    });

    // Broadcast the action to organization members
    broadcastAction(action);
  } catch (error) {
    console.error("Error creating user action:", error);
    throw error;
  }
};
