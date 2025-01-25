import { Request, Response } from 'express';
import { prisma } from '../index';
import { UserRole, UserStatus } from '../utils/constants';

const EXISTING_USER_ERROR_STATUS = {
  [UserStatus.ACTIVE]: 'User already exists',
  [UserStatus.REMOVED_BY_ADMIN]: 'User is removed, Ask for a new invitation',
  [UserStatus.REMOVED_BY_SELF]: 'User is removed, Ask for a new invitation',
  [UserStatus.INVITATION_REJECTED]: 'User invitation rejected in past, Ask for a new invitation',
  [UserStatus.INVITATION_REVOKED]: 'User invitation revoked, Ask for a new invitation',
  [UserStatus.INVITATION_PENDING]: false, // will not happen
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (Object.keys(EXISTING_USER_ERROR_STATUS).filter(Boolean).includes(existingUser.status)) {
        res.status(400).json({ message: EXISTING_USER_ERROR_STATUS[existingUser.status] });
        return;
      }

      // accept invitation
      await prisma.user.update({
        where: { email },
        data: {
          status: UserStatus.ACTIVE,
        },
      });
      res.status(200).json({...existingUser, status: UserStatus.ACTIVE});
      return;
    }

    if (!organizationName) {
      res.status(400).json({ message: 'Organization name is required' });
      return;
    }

    // Create organization and admin user
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: {
            email,
            name,
            role: UserRole.ADMIN,
          },
        },
      },
      include: {
        users: true,
      },
    });

    // TODO: Implement proper authentication with Auth0/Clerk
    res.status(201).json({
      user: organization.users[0],
      organization,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // TODO: Implement proper authentication with Auth0/Clerk
    res.json({
      user,
      organization: user.organization,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};
