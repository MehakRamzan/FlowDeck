import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createOrganizationSchema, transferOwnershipSchema, updateMemberRoleSchema, updateOrganizationSchema } from "./organization.schema.js";
import {
  createOrganization,
  getOrganizationForUser,
  getOrganizationMembers,
  getUserOrganizations,
  deleteOrganization,
  removeOrganizationMember,
  transferOrganizationOwnership,
  updateOrganization,
  updateOrganizationMemberRole,
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

function param(request: Request, name: string) {
  const value = request.params[name];
  if (typeof value !== "string") throw new Error(`Invalid ${name}`);
  return value;
}

function adminStatus(message: string) {
  if (message.includes("permission")) return 403;
  if (message.includes("not found")) return 404;
  if (message.includes("already") || message.includes("cannot") || message.includes("Transfer") || message.includes("taken")) return 409;
  return 500;
}

export async function updateWorkspace(request: Request, response: Response) {
  const parsed = updateOrganizationSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors }); return; }
  try {
    const organization = await updateOrganization((request as AuthenticatedRequest).user.userId, param(request, "organizationId"), parsed.data);
    response.json({ success: true, data: { organization } });
  } catch (error) { const message = error instanceof Error ? error.message : "Unable to update workspace"; response.status(adminStatus(message)).json({ success: false, message }); }
}

export async function deleteWorkspace(request: Request, response: Response) {
  try { await deleteOrganization((request as AuthenticatedRequest).user.userId, param(request, "organizationId")); response.json({ success: true, message: "Workspace deleted" }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to delete workspace"; response.status(adminStatus(message)).json({ success: false, message }); }
}

export async function transferWorkspaceOwnership(request: Request, response: Response) {
  const parsed = transferOwnershipSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ success: false, message: "A new owner is required" }); return; }
  try { await transferOrganizationOwnership((request as AuthenticatedRequest).user.userId, param(request, "organizationId"), parsed.data.userId); response.json({ success: true, message: "Ownership transferred" }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to transfer ownership"; response.status(adminStatus(message)).json({ success: false, message }); }
}

export async function changeWorkspaceMemberRole(request: Request, response: Response) {
  const parsed = updateMemberRoleSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ success: false, message: "Invalid role" }); return; }
  try { const member = await updateOrganizationMemberRole((request as AuthenticatedRequest).user.userId, param(request, "organizationId"), param(request, "memberId"), parsed.data.role); response.json({ success: true, data: { member } }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to update member"; response.status(adminStatus(message)).json({ success: false, message }); }
}

export async function removeWorkspaceMember(request: Request, response: Response) {
  try { await removeOrganizationMember((request as AuthenticatedRequest).user.userId, param(request, "organizationId"), param(request, "memberId")); response.json({ success: true, message: "Member removed" }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to remove member"; response.status(adminStatus(message)).json({ success: false, message }); }
}
