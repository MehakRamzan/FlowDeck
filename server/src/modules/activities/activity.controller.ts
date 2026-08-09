import type { Request, Response } from "express";

import { getProjectActivities } from "./activity.service.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

export async function getProjectActivitiesController(
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

    const activities =
      await getProjectActivities(
        userId,
        projectId
      );

    response.status(200).json({
      success: true,
      data: {
        activities,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve activities";

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