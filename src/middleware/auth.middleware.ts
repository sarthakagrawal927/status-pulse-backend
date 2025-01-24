import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

export interface AuthenticatedRequest extends Request {
  user?: any;
  organizationId?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header' });
      return;
    }

    // TODO: Implement actual JWT verification with Auth0
    // For now, we'll assume the token is the user's email for development
    const email = authHeader.replace('Bearer ', '');

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
