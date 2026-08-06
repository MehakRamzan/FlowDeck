import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.service.js";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export async function register(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = registerSchema.safeParse(request.body);

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const user = await registerUser(validationResult.data);

    response.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    const statusCode = message.includes("already exists") ? 409 : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function login(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = loginSchema.safeParse(request.body);

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const result = await loginUser(validationResult.data);

    response.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";

    const statusCode =
      message === "Invalid email or password" ? 401 : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}


export async function me(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const user = await getCurrentUser(userId);

    response.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve user";

    response.status(message === "User not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}