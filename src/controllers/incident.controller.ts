import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getIncidents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: req.organizationId,
      },
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents' });
  }
};

export const getIncidentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incident' });
  }
};

export const createIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, serviceId, impact } = req.body;

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: req.organizationId,
      },
    });

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        impact,
        serviceId,
        organizationId: req.organizationId!,
      },
      include: {
        service: true,
      },
    });

    // TODO: Emit socket event for real-time updates

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error creating incident' });
  }
};

export const updateIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, status, impact } = req.body;

    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    const updatedIncident = await prisma.incident.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        description,
        status,
        impact,
      },
      include: {
        service: true,
        updates: true,
      },
    });

    // TODO: Emit socket event for real-time updates

    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident' });
  }
};

export const deleteIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    await prisma.incident.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting incident' });
  }
};

export const addStatusUpdate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;

    const incident = await prisma.incident.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
      },
    });

    if (!incident) {
      res.status(404).json({ message: 'Incident not found' });
      return;
    }

    const statusUpdate = await prisma.statusUpdate.create({
      data: {
        message,
        incidentId: req.params.id,
      },
    });

    // TODO: Emit socket event for real-time updates

    res.status(201).json(statusUpdate);
  } catch (error) {
    res.status(500).json({ message: 'Error adding status update' });
  }
};
