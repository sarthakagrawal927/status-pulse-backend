import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { IncidentStatus, Impact } from "../../utils/constants";

// Validation schemas
const incidentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  serviceId: z.string(),
  status: z.nativeEnum(IncidentStatus),
  impact: z.nativeEnum(Impact),
});

const updateIncidentSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    status: z.nativeEnum(IncidentStatus).optional(),
    impact: z.nativeEnum(Impact).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const statusUpdateSchema = z.object({
  message: z.string().min(1).max(1000),
  status: z.nativeEnum(IncidentStatus),
});

const idParamSchema = z.object({
  id: z.string(),
});

// Middleware functions
export const validateCreateIncident = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = incidentSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Invalid input",
      errors: result.error.errors,
    });
  }
  next();
};

export const validateUpdateIncident = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const paramsResult = idParamSchema.safeParse({ id: req.params.id });
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid incident ID",
      errors: paramsResult.error.errors,
    });
  }

  const bodyResult = updateIncidentSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: "Invalid input",
      errors: bodyResult.error.errors,
    });
  }
  next();
};

export const validateIncidentId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = idParamSchema.safeParse({ id: req.params.id });
  if (!result.success) {
    res.status(400).json({
      message: "Invalid incident ID",
      errors: result.error.errors,
    });
  }
  next();
};

export const validateStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const paramsResult = idParamSchema.safeParse({ id: req.params.id });
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid incident ID",
      errors: paramsResult.error.errors,
    });
  }

  const bodyResult = statusUpdateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: "Invalid status update",
      errors: bodyResult.error.errors,
    });
  }
  next();
};
