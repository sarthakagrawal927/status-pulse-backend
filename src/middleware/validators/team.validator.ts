import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole } from '../../utils/constants';

// Validation schemas
const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum([UserRole.ADMIN, UserRole.USER])
});

const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum([UserRole.ADMIN, UserRole.USER]).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

// Middleware functions
export const validateInviteTeamMember = (req: Request, res: Response, next: NextFunction) => {
  const result = inviteTeamMemberSchema.safeParse(req.body);
  if (!result.success) {
     res.status(400).json({
      message: 'Invalid input',
      errors: result.error.errors
    });
  }
  next();
};

export const validateUpdateTeamMember = (req: Request, res: Response, next: NextFunction) => {
  const paramsResult = idParamSchema.safeParse({ id: req.params.id });
  if (!paramsResult.success) {
    res.status(400).json({
      message: 'Invalid user ID',
      errors: paramsResult.error.errors
    });
  }

  const bodyResult = updateTeamMemberSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: bodyResult.error.errors
    });
  }
  next();
};

export const validateTeamMemberId = (req: Request, res: Response, next: NextFunction) => {
  const result = idParamSchema.safeParse({ id: req.params.id });
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid user ID',
      errors: result.error.errors
    });
  }
  next();
};