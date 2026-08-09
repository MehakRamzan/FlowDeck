import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  acceptInvitationSchema,
  createInvitationSchema,
} from "./invitation.schema.js";
import {
  acceptInvitation,
  createInvitation,
  previewInvitation,
  listInvitations,
  resendInvitation,
  revokeInvitation,
} from "./invitation.service.js";

export async function listInvitationsController(request: Request, response: Response) {
  try { const invitations = await listInvitations((request as AuthenticatedRequest).user.userId, String(request.params.organizationId)); response.json({ success: true, data: { invitations } }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to list invitations"; response.status(message.includes("permission") ? 403 : 500).json({ success: false, message }); }
}

export async function revokeInvitationController(request: Request, response: Response) {
  try { await revokeInvitation((request as AuthenticatedRequest).user.userId, String(request.params.invitationId)); response.json({ success: true, message: "Invitation revoked" }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to revoke invitation"; response.status(message.includes("permission") ? 403 : message.includes("not found") ? 404 : 500).json({ success: false, message }); }
}

export async function resendInvitationController(request: Request, response: Response) {
  try { const result = await resendInvitation((request as AuthenticatedRequest).user.userId, String(request.params.invitationId)); response.json({ success: true, data: result }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to resend invitation"; response.status(message.includes("permission") ? 403 : message.includes("not found") ? 404 : 500).json({ success: false, message }); }
}

export async function previewInvitationController(
  request: Request,
  response: Response
): Promise<void> {
  const { token } = request.params;

  if (!token || typeof token !== "string") {
    response.status(400).json({
      success: false,
      message: "Invitation token is required",
      code: "NOT_FOUND",
    });
    return;
  }

  try {
    const preview = await previewInvitation(token);

    if (!preview.exists) {
      response.status(404).json({
        success: false,
        message: "Invitation not found",
        code: "NOT_FOUND",
      });
      return;
    }

    if (preview.accepted) {
      response.status(409).json({
        success: false,
        message: "Invitation has already been accepted",
        code: "ALREADY_ACCEPTED",
      });
      return;
    }

    if (preview.expired) {
      response.status(410).json({
        success: false,
        message: "Invitation has expired",
        code: "EXPIRED",
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load invitation";

    response.status(500).json({
      success: false,
      message,
      code: "UNKNOWN",
    });
  }
}

export async function createInvitationController(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = createInvitationSchema.safeParse(request.body);

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

    const invitation = await createInvitation(
      userId,
      validationResult.data
    );

    response.status(201).json({
      success: true,
      message: invitation.emailSent
        ? "Invitation created and emailed successfully"
        : "Invitation created, but the email could not be sent",
      data: {
        invitation,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create invitation";

    const statusCode =
      message === "Workspace not found or access denied"
        ? 404
        : message === "You do not have permission to invite members"
          ? 403
          : message === "User is already a member of this workspace"
            ? 409
            : message === "An active invitation already exists for this email"
              ? 409
              : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function acceptInvitationController(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = acceptInvitationSchema.safeParse(request.body);

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

    const membership = await acceptInvitation(
      userId,
      validationResult.data
    );

    response.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: {
        membership,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to accept invitation";

    const statusCode =
      message === "Invitation not found"
        ? 404
        : message === "Invitation has expired"
          ? 410
          : message === "Invitation has already been accepted" ||
              message === "You are already a member of this workspace"
            ? 409
            : message === "This invitation belongs to a different email"
              ? 403
              : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}
