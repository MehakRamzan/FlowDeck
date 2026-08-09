import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

type TokenPayload = {
  userId: string;
  email: string;
  sessionId: string;
};

export type AuthenticatedRequest = Request & {
  user: TokenPayload;
};

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    response.status(401).json({
      success: false,
      message: "Authentication token is required",
    });

    return;
  }

  const token = authorizationHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    response.status(500).json({
      success: false,
      message: "JWT configuration is missing",
    });

    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.sessionId !== "string"
    ) {
      response.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });

      return;
    }

    const session = await prisma.session.findFirst({ where: { id: decoded.sessionId, userId: decoded.userId, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!session) { response.status(401).json({ success: false, message: "Session is no longer active" }); return; }
    await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
    (request as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}
