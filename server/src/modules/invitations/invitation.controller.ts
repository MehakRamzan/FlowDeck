import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  acceptInvitationSchema,
  createInvitationSchema,
} from "./invitation.schema.js";
import {
  acceptInvitation,
  createInvitation,
} from "./invitation.service.js";

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
      message: "Invitation created successfully",
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