import type { Request, Response } from "express";


import {
  createTask,
deleteTask,
getColumnTasks,
getProjectTasks,
getTaskById,
moveTask,
updateTask,
} from "./task.service.js";

import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "./task.schema.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

function getErrorStatus(message: string) {
  if (
    message === "Project not found" ||
    message === "Task not found" ||
    message === "Board column not found"
  ) {
    return 404;
  }

  if (
    message ===
    "You do not belong to this workspace"
  ) {
    return 403;
  }

  if (
    message ===
      "Board column does not belong to this project" ||
    message ===
      "Assignee does not belong to this workspace"
  ) {
    return 400;
  }

  return 500;
}

export async function createTaskController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const projectId =
      request.params.projectId;

    const columnId =
      request.params.columnId;

    if (
      typeof projectId !== "string" ||
      typeof columnId !== "string"
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid project or column ID",
      });

      return;
    }

    const parsed =
      createTaskSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid task data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const task = await createTask(
      userId,
      projectId,
      columnId,
      parsed.data
    );

    response.status(201).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create task";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getProjectTasksController(
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

    const tasks = await getProjectTasks(
      userId,
      projectId
    );

    response.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve tasks";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getColumnTasksController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const columnId =
      request.params.columnId;

    if (typeof columnId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid column ID",
      });

      return;
    }

    const tasks = await getColumnTasks(
      userId,
      columnId
    );

    response.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve tasks";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getTaskController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const taskId =
      request.params.taskId;

    if (typeof taskId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid task ID",
      });

      return;
    }

    const task = await getTaskById(
      userId,
      taskId
    );

    response.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve task";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function updateTaskController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const taskId =
      request.params.taskId;

    if (typeof taskId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid task ID",
      });

      return;
    }

    const parsed =
      updateTaskSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid task data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const task = await updateTask(
      userId,
      taskId,
      parsed.data
    );

    response.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update task";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function deleteTaskController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const taskId =
      request.params.taskId;

    if (typeof taskId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid task ID",
      });

      return;
    }

    await deleteTask(
      userId,
      taskId
    );

    response.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete task";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function moveTaskController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const taskId =
      request.params.taskId;

    if (typeof taskId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid task ID",
      });

      return;
    }

    const parsed =
      moveTaskSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid move data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const task = await moveTask(
      userId,
      taskId,
      parsed.data.targetColumnId,
      parsed.data.targetPosition
    );

    response.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to move task";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}