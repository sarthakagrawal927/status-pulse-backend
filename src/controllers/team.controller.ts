import { Response } from "express";
import { prisma } from "../index";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { NEGATED_USER_STATUS, UserRole, UserStatus } from "../utils/constants";

export const getTeamMembers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: req.organizationId,
        status: {
          notIn: NEGATED_USER_STATUS,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        status: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team members" });
  }
};

// ideally you would want to log all invitations and rejections in the database for audit purposes
export const inviteTeamMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { email, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!NEGATED_USER_STATUS.includes(existingUser.status)) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // accept invitation
      await prisma.user.update({
        where: { email },
        data: {
          status: UserStatus.ACTIVE,
        },
      });
      res.status(200).json(existingUser);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        organizationId: req.organizationId!,
        status: UserStatus.INVITATION_PENDING,
      },
    });

    // TODO: Send invitation email

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error inviting team member" });
  }
};

export const removeTeamMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== req.params.id) {
      res.json({ message: "Admin access required" });
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (NEGATED_USER_STATUS.includes(user.status)) {
      res.status(400).json({ message: "User is not removable" });
      return;
    }

    if (user.status === UserStatus.INVITATION_PENDING) {
      // revoke invitation
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status:
            req.user.id === user.id
              ? UserStatus.INVITATION_REJECTED
              : UserStatus.INVITATION_REVOKED,
        },
      });
      res.status(204).send();
      return;
    }

    // Prevent removing the last admin
    if (user.role === UserRole.ADMIN) {
      // would ideally want to lock the org rows here, to handle concurrent updates
      const adminCount = await prisma.user.count({
        where: {
          organizationId: req.organizationId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        res.status(400).json({ message: "Cannot remove the last admin" });
        return;
      }
    }

    await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        status:
          req.user.id === user.id
            ? UserStatus.REMOVED_BY_SELF
            : UserStatus.REMOVED_BY_ADMIN,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error removing team member" });
  }
};

export const updateTeamMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, role } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!user || NEGATED_USER_STATUS.includes(user.status)) {
      res.status(404).json({ message: "User not found or unable to update" });
      return;
    }

    // Prevent demoting the last admin
    if (user.role === UserRole.ADMIN && role === UserRole.MEMBER) {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: req.organizationId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        res.status(400).json({ message: "Cannot demote the last admin" });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        name,
        role,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating team member" });
  }
};
