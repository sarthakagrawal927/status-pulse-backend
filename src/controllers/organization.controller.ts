import { Request, Response } from "express";
import { prisma } from "..";

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
