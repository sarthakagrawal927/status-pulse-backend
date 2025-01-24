import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getTeamMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: req.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members' });
  }
};

export const inviteTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        organizationId: req.organizationId!,
      },
    });

    // TODO: Send invitation email

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error inviting team member' });
  }
};

export const removeTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent removing the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: req.organizationId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        res.status(400).json({ message: 'Cannot remove the last admin' });
        return;
      }
    }

    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error removing team member' });
  }
};

export const updateTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, role } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent removing the last admin
    if (user.role === 'ADMIN' && role === 'USER') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: req.organizationId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        res.status(400).json({ message: 'Cannot remove the last admin' });
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
    res.status(500).json({ message: 'Error updating team member' });
  }
};
