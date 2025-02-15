import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";

// Import routes
import serviceRoutes from "./routes/service.routes";
import incidentRoutes from "./routes/incident.routes";
import teamRoutes from "./routes/team.routes";
import authRoutes from "./routes/auth.routes";
import actionRoutes from "./routes/action.routes";
import organizationRoutes from "./routes/organization.routes";
import serviceMaintenanceRoutes from "./routes/serviceMaintenance.routes";

import { initializeSocket } from "./services/socket.service";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.path}`);
  next();
});

// Routes
app.use("/api/services", serviceRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/maintenance", serviceMaintenanceRoutes);

initializeSocket(io);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", { error: err.stack });
    res.status(500).json({ message: "Something went wrong!" });
  }
);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
