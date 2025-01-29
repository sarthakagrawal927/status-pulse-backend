import { Request, Response } from "express";
import { prisma } from "../index";
import { UserRole, UserStatus } from "../utils/constants";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.config";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const EXISTING_USER_ERROR_STATUS: Record<UserStatus, string | boolean> = {
  [UserStatus.ACTIVE]: "User already exists",
  [UserStatus.REMOVED_BY_ADMIN]: "User is removed, Ask for a new invitation",
  [UserStatus.REMOVED_BY_SELF]: "User is removed, Ask for a new invitation",
  [UserStatus.INVITATION_REJECTED]:
    "User invitation rejected in past, Ask for a new invitation",
  [UserStatus.INVITATION_REVOKED]:
    "User invitation revoked, Ask for a new invitation",
  [UserStatus.INVITATION_PENDING]: false, // will not happen
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, organizationName, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    if (existingUser) {
      if (
        Object.keys(EXISTING_USER_ERROR_STATUS)
          .filter(
            (val) => EXISTING_USER_ERROR_STATUS[val as UserStatus] !== false
          )
          .includes(existingUser.status)
      ) {
        res
          .status(400)
          .json({ message: EXISTING_USER_ERROR_STATUS[existingUser.status] });
        return;
      }

      // accept invitation
      await prisma.user.update({
        where: { email },
        data: {
          name,
          status: UserStatus.ACTIVE,
          password: hashedPassword,
        },
      });
      res.status(200).json({ ...existingUser, status: UserStatus.ACTIVE });
      return;
    }

    if (!organizationName) {
      res.status(400).json({ message: "Organization name is required" });
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
            role: UserRole.ADMIN,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
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
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.password) {
      res.status(401).json({ message: "Password not set" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Since we're using AuthenticatedRequest, we already have the user info from the middleware
    const { id, email, role, organizationId } = req.user;

    res.json({
      user: {
        id,
        email,
        role,
        organizationId,
        organization: await prisma.organization.findUnique({
          where: { id: organizationId },
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting user info" });
  }
};
