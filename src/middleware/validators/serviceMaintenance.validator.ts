import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schema for service maintenance validation
const serviceMaintenanceSchema = z.object({
  serviceId: z.string({
    required_error: "Service ID is required",
    invalid_type_error: "Service ID must be a string",
  }),
  start: z
    .string()
    .or(z.date())
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Invalid start date")
    .transform((date) => new Date(date))
    .refine((date) => date > new Date(), "Start date must be in the future"),
  end: z
    .string()
    .or(z.date())
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Invalid end date")
    .transform((date) => new Date(date)),
  notes: z.string().optional(),
});

const updateServiceMaintenanceSchema = serviceMaintenanceSchema
  .partial()
  .extend({
    start: z
      .string()
      .or(z.date())
      .refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      }, "Invalid start date")
      .transform((date) => new Date(date))
      .optional(),
    end: z
      .string()
      .or(z.date())
      .refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      }, "Invalid end date")
      .transform((date) => new Date(date))
      .optional(),
  });

// Middleware for validating maintenance creation
export const validateCreateMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = await serviceMaintenanceSchema.parseAsync(req.body);

    // Additional validation for end date being after start date
    if (validatedData.end <= validatedData.start) {
      res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Store validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// Middleware for validating maintenance updates
export const validateUpdateMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = await updateServiceMaintenanceSchema.parseAsync(
      req.body
    );

    // If both start and end dates are provided, validate their order
    if (validatedData.start && validatedData.end) {
      if (validatedData.end <= validatedData.start) {
        res.status(400).json({
          message: "End date must be after start date",
        });
      }
    }

    // Store validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// Middleware for validating IDs
export const validateMaintenanceId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      id: z.string({
        required_error: "Maintenance ID is required",
        invalid_type_error: "Maintenance ID must be a string",
      }),
    });

    await schema.parseAsync({ id: req.params.id });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Invalid maintenance ID",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};
