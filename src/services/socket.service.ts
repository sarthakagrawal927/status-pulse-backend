import { UserAction } from "@prisma/client";
import { Server } from "socket.io";
import logger from "../utils/logger";

export type SocketEvent = {
  data: any;
  organizationId: string;
};

let io: Server;

export const initializeSocket = (socketIo: Server) => {
  io = socketIo;

  io.on("connection", (socket) => {
    logger.info("Client connected");

    // Handle joining organization room
    socket.on("join-organization", (organizationId: string) => {
      joinOrganizationRoom(socket, organizationId);
      logger.info(`Client joined organization room: ${organizationId}`);
    });

    // Handle leaving organization room
    socket.on("leave-organization", (organizationId: string) => {
      leaveOrganizationRoom(socket, organizationId);
      logger.info(`Client left organization room: ${organizationId}`);
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });
  });
};

export const joinOrganizationRoom = (socket: any, organizationId: string) => {
  socket.join(`org:${organizationId}`);
};

export const leaveOrganizationRoom = (socket: any, organizationId: string) => {
  socket.leave(`org:${organizationId}`);
};

export const broadcastToOrganization = (event: SocketEvent) => {
  if (!io) {
    console.warn("Socket.io not initialized");
    return;
  }

  // Broadcast to the specific organization's room
  io.to(`org:${event.organizationId}`).emit("action", {
    data: event.data,
  });
};

// Helper functions for specific event types
export const broadcastAction = (action: UserAction) => {
  broadcastToOrganization({
    data: action,
    organizationId: action.organizationId,
  });
};
