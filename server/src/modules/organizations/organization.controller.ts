import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createOrganizationSchema } from "./organization.schema.js";
import {
  createOrganization,
  getOrganizationForUser,
  getOrganizationMembers,
  getUserOrganizations,
} from "./organization.service.js";

export async function createWorkspace(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = createOrganizationSchema.safeParse(request.body);

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

    const organization = await createOrganization(
      userId,
      validationResult.data
    );

    response.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: {
        organization,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create workspace";

    response
      .status(message === "This workspace URL is already taken" ? 409 : 500)
      .json({
        success: false,
        message,
      });
  }
}

export async function getMyWorkspaces(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const organizations = await getUserOrganizations(userId);

    response.status(200).json({
      success: true,
      data: {
        organizations,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve workspaces";

    response.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getWorkspaceById(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const organizationId = request.params.organizationId;

    if (typeof organizationId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });

      return;
    }

    const workspace = await getOrganizationForUser(
      userId,
      organizationId
    );

    response.status(200).json({
      success: true,
      data: {
        workspace,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve workspace";

    response
      .status(
        message === "Workspace not found or access denied"
          ? 404
          : 500
      )
      .json({
        success: false,
        message,
      });
  }
}


export async function getWorkspaceMembers(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;
    const organizationId = request.params.organizationId;

    if (typeof organizationId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid organization ID",
      });

      return;
    }

    const members = await getOrganizationMembers(
      userId,
      organizationId
    );

    response.status(200).json({
      success: true,
      data: {
        members,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve workspace members";

    response
      .status(
        message === "Workspace not found or access denied"
          ? 404
          : 500
      )
      .json({
        success: false,
        message,
      });
  }
}