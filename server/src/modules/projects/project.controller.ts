import type { Request, Response } from "express";

import {
  createProject,
  deleteProject,
  getProjectById,
  getTeamProjects,
  updateProject,
} from "./project.service.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.schema.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

export async function createProjectController(
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

    const parsed = createProjectSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const project = await createProject(
      userId,
      teamId,
      parsed.data
    );

    response.status(201).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create project";

    const status =
      message === "Team not found"
        ? 404
        : message === "You do not belong to this workspace"
          ? 403
          : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}

export async function getTeamProjectsController(
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

    const projects = await getTeamProjects(
      userId,
      teamId
    );

    response.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve projects";

    const status =
      message === "Team not found"
        ? 404
        : message === "You do not belong to this workspace"
          ? 403
          : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}

export async function getProjectController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const projectId = request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    const project = await getProjectById(
      userId,
      projectId
    );

    response.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve project";

    const status =
      message === "Project not found"
        ? 404
        : message === "You do not belong to this workspace"
          ? 403
          : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}

export async function updateProjectController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const projectId = request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    const parsed = updateProjectSchema.safeParse(
      request.body
    );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const project = await updateProject(
      userId,
      projectId,
      parsed.data
    );

    response.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update project";

    const status =
      message === "Project not found"
        ? 404
        : message === "You do not belong to this workspace"
          ? 403
          : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}

export async function deleteProjectController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } = (request as AuthenticatedRequest).user;

    const projectId = request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    await deleteProject(
      userId,
      projectId
    );

    response.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete project";

    const status =
      message === "Project not found"
        ? 404
        : message === "You do not belong to this workspace"
          ? 403
          : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}