import type { Request, Response } from "express";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, updateProfileSchema, verifyEmailSchema } from "./auth.schema.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateUserProfile,
  changePassword,
  getSessions,
  requestPasswordReset,
  resetPassword,
  revokeSession,
  sendVerificationEmail,
  verifyEmail,
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
    const result = await loginUser(validationResult.data, { userAgent: request.get("user-agent"), ipAddress: request.ip });

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

export async function forgotPassword(request: Request, response: Response) { const parsed = forgotPasswordSchema.safeParse(request.body); if (!parsed.success) { response.status(400).json({ success: false, message: "Valid email is required" }); return; } await requestPasswordReset(parsed.data.email); response.json({ success: true, message: "If that account exists, a reset link has been sent" }); }
export async function resetPasswordController(request: Request, response: Response) { const parsed = resetPasswordSchema.safeParse(request.body); if (!parsed.success) { response.status(400).json({ success: false, message: "Invalid reset request" }); return; } try { await resetPassword(parsed.data.token, parsed.data.password); response.json({ success: true, message: "Password reset successfully" }); } catch (error) { response.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to reset password" }); } }
export async function changePasswordController(request: Request, response: Response) { const parsed = changePasswordSchema.safeParse(request.body); if (!parsed.success) { response.status(400).json({ success: false, message: "Invalid password data" }); return; } try { const auth = (request as AuthenticatedRequest).user; await changePassword(auth.userId, parsed.data.currentPassword, parsed.data.newPassword, auth.sessionId); response.json({ success: true, message: "Password changed" }); } catch (error) { response.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to change password" }); } }
export async function verifyEmailController(request: Request, response: Response) { const parsed = verifyEmailSchema.safeParse(request.body); if (!parsed.success) { response.status(400).json({ success: false, message: "Verification token is required" }); return; } try { await verifyEmail(parsed.data.token); response.json({ success: true, message: "Email verified" }); } catch (error) { response.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to verify email" }); } }
export async function resendVerification(request: Request, response: Response) { const auth = (request as AuthenticatedRequest).user; const user = await getCurrentUser(auth.userId); if (user.emailVerifiedAt) { response.json({ success: true, message: "Email is already verified" }); return; } const delivery = await sendVerificationEmail(user.id, user.email); if (!delivery.sent) { response.status(503).json({ success: false, message: "Unable to send verification email right now. Please try again." }); return; } response.json({ success: true, message: "Verification email sent" }); }
export async function listSessions(request: Request, response: Response) { const sessions = await getSessions((request as AuthenticatedRequest).user.userId); response.json({ success: true, data: { sessions, currentSessionId: (request as AuthenticatedRequest).user.sessionId } }); }
export async function revokeSessionController(request: Request, response: Response) { try { await revokeSession((request as AuthenticatedRequest).user.userId, String(request.params.sessionId)); response.json({ success: true, message: "Session revoked" }); } catch (error) { response.status(404).json({ success: false, message: error instanceof Error ? error.message : "Session not found" }); } }

export async function updateProfile(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = updateProfileSchema.safeParse(request.body);

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { userId } = (request as AuthenticatedRequest).user;
    const user = await updateUserProfile(userId, validationResult.data);

    response.status(200).json({ success: true, data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    response.status(message.includes("already exists") ? 409 : 500).json({
      success: false,
      message,
    });
  }
}
