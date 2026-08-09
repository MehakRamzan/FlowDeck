import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isPublicDemoEmail } from "../lib/demo.js";

type TokenPayload = {
  email?: unknown;
};

const readOnlyMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function protectPublicDemoAccounts(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (readOnlyMethods.has(request.method)) {
    next();
    return;
  }

  const authorizationHeader = request.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!authorizationHeader?.startsWith("Bearer ") || !jwtSecret) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(
      authorizationHeader.slice("Bearer ".length),
      jwtSecret
    ) as TokenPayload;

    if (
      typeof decoded.email === "string" &&
      isPublicDemoEmail(decoded.email)
    ) {
      response.status(403).json({
        success: false,
        message:
          "Demo accounts are read-only so the showcase stays ready for every visitor.",
      });
      return;
    }
  } catch {
    // Protected routes still validate invalid or expired tokens in requireAuth.
  }

  next();
}
