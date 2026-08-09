import type { Request, Response } from "express";

import {
  createBoardColumn,
  deleteBoardColumn,
  getBoardColumnById,
  getProjectColumns,
  updateBoardColumn,
  reorderBoardColumns,
} from "./board-column.service.js";

import {
  createBoardColumnSchema,
  updateBoardColumnSchema,
  reorderBoardColumnsSchema,
} from "./board-column.schema.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

export async function reorderBoardColumnsController(request: Request, response: Response) {
  const parsed = reorderBoardColumnsSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ success: false, message: "Invalid column order" }); return; }
  try { await reorderBoardColumns((request as AuthenticatedRequest).user.userId, String(request.params.projectId), parsed.data.columnIds); response.json({ success: true, message: "Columns reordered" }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to reorder columns"; response.status(message.includes("belong") ? 403 : message.includes("not found") ? 404 : 400).json({ success: false, message }); }
}

function getErrorStatus(message: string) {
  if (
    message === "Project not found" ||
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
      "A column already exists at this position"
  ) {
    return 409;
  }

  return 500;
}

export async function createBoardColumnController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const projectId = request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    const parsed =
      createBoardColumnSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid board column data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const column = await createBoardColumn(
      userId,
      projectId,
      parsed.data
    );

    response.status(201).json({
      success: true,
      data: {
        column,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create board column";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getProjectColumnsController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const projectId = request.params.projectId;

    if (typeof projectId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid project ID",
      });

      return;
    }

    const columns = await getProjectColumns(
      userId,
      projectId
    );

    response.status(200).json({
      success: true,
      data: {
        columns,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve board columns";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getBoardColumnController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const columnId = request.params.columnId;

    if (typeof columnId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid column ID",
      });

      return;
    }

    const column = await getBoardColumnById(
      userId,
      columnId
    );

    response.status(200).json({
      success: true,
      data: {
        column,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve board column";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function updateBoardColumnController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const columnId = request.params.columnId;

    if (typeof columnId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid column ID",
      });

      return;
    }

    const parsed =
      updateBoardColumnSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid board column data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const column = await updateBoardColumn(
      userId,
      columnId,
      parsed.data
    );

    response.status(200).json({
      success: true,
      data: {
        column,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update board column";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function deleteBoardColumnController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const columnId = request.params.columnId;

    if (typeof columnId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid column ID",
      });

      return;
    }

    await deleteBoardColumn(
      userId,
      columnId
    );

    response.status(200).json({
      success: true,
      message: "Board column deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete board column";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}
