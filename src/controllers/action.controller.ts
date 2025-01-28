import { ActionType, Prisma } from "@prisma/client";
import { Response } from "express";
import { prisma } from "..";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Get all actions with pagination and filtering
export const getUserActions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      page = 1,
      limit = 10,
      actionType,
      serviceId,
      incidentId,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause based on filters
    const where: Prisma.UserActionWhereInput = {
      organizationId: req.user.organizationId,
      ...(actionType && { actionType: actionType as ActionType }),
      ...(serviceId && { serviceId: serviceId as string }),
      ...(incidentId && { incidentId: incidentId as string }),
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
    console.error("Error fetching actions:", error);
    res.status(500).json({ error: "Failed to fetch actions" });
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
    return await prisma.userAction.create({
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
  } catch (error) {
    console.error("Error creating user action:", error);
    throw error;
  }
};
