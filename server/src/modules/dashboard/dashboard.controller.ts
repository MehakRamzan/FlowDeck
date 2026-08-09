import type { Request, Response } from "express";

import { getProjectDashboard } from "./dashboard.service.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

export async function getProjectDashboardController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const projectId =
      request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    const dashboard =
      await getProjectDashboard(
        userId,
        projectId
      );

    response.status(200).json({
      success: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve dashboard";

    const status =
      message === "Project not found"
        ? 404
        : message ===
          "You do not belong to this workspace"
        ? 403
        : 500;

    response.status(status).json({
      success: false,
      message,
    });
  }
}