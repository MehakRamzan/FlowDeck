import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import {
  addTeamMemberSchema,
  createTeamSchema,
} from "./team.schema.js";
import {
  addTeamMember,
  createTeam,
  getTeamById,
  getTeamsByOrganization,
} from "./team.service.js";

export async function createTeamController(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = createTeamSchema.safeParse(request.body);

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

    const team = await createTeam(
      userId,
      validationResult.data
    );

    response.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create team";

    const statusCode =
      message === "Workspace not found or access denied"
        ? 404
        : message === "You do not have permission to create teams"
          ? 403
          : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function getTeamsController(
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

    const teams = await getTeamsByOrganization(
      userId,
      organizationId
    );

    response.status(200).json({
      success: true,
      data: {
        teams,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve teams";

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

export async function getTeamByIdController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;
    const teamId = request.params.teamId;

    if (typeof teamId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid team ID",
      });

      return;
    }

    const team = await getTeamById(userId, teamId);

    response.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve team";

    const statusCode =
      message === "Team not found" ||
      message === "Team not found or access denied"
        ? 404
        : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function addTeamMemberController(
  request: Request,
  response: Response
): Promise<void> {
  const validationResult = addTeamMemberSchema.safeParse(request.body);

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
    const teamId = request.params.teamId;

    if (typeof teamId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid team ID",
      });

      return;
    }

    const teamMember = await addTeamMember(
      userId,
      teamId,
      validationResult.data
    );

    response.status(201).json({
      success: true,
      message: "Team member added successfully",
      data: {
        teamMember,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add team member";

    const statusCode =
      message === "Team not found" ||
      message === "Team not found or access denied"
        ? 404
        : message === "You do not have permission to add team members"
          ? 403
          : message === "User is not a member of this workspace"
            ? 400
            : message === "User is already a member of this team"
              ? 409
              : 500;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
}