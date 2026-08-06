import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: TokenPayload;
};

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
): void {
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
      typeof decoded.email !== "string"
    ) {
      response.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });

      return;
    }

    (request as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}