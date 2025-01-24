import { Request, Response } from 'express';
import { prisma } from '../index';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
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
            role: 'ADMIN',
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
      res.status(401).json({ message: 'Invalid credentials' });
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
