import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ServiceStatus } from '../../utils/constants';

// Validation schemas
const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  status: z.nativeEnum(ServiceStatus)
});

const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  status: z.nativeEnum(ServiceStatus).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

// Middleware functions
export const validateCreateService = (req: Request, res: Response, next: NextFunction) => {
  const result = serviceSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: result.error.errors
    });
  }
  next();
};

export const validateUpdateService = (req: Request, res: Response, next: NextFunction) => {
  const paramsResult = idParamSchema.safeParse({ id: req.params.id });
  if (!paramsResult.success) {
    res.status(400).json({
      message: 'Invalid service ID',
      errors: paramsResult.error.errors
    });
  }

  const bodyResult = updateServiceSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: bodyResult.error.errors
    });
  }
  next();
};

export const validateServiceId = (req: Request, res: Response, next: NextFunction) => {
  const result = idParamSchema.safeParse({ id: req.params.id });
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid service ID',
      errors: result.error.errors
    });
  }
  next(); 
};