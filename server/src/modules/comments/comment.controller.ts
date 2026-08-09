import type { Request, Response } from "express";

import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "./comment.service.js";

import {
  createCommentSchema,
  updateCommentSchema,
} from "./comment.schema.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

function getErrorStatus(message: string) {
  if (
    message === "Task not found" ||
    message === "Comment not found"
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
      "You can only edit your own comments" ||
    message ===
      "You can only delete your own comments"
  ) {
    return 403;
  }

  return 500;
}

export async function createCommentController(
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
      createCommentSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid comment data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const comment = await createComment(
      userId,
      taskId,
      parsed.data.content
    );

    response.status(201).json({
      success: true,
      data: {
        comment,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create comment";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function getTaskCommentsController(
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

    const comments =
      await getTaskComments(
        userId,
        taskId
      );

    response.status(200).json({
      success: true,
      data: {
        comments,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve comments";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function updateCommentController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const commentId =
      request.params.commentId;

    if (typeof commentId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });

      return;
    }

    const parsed =
      updateCommentSchema.safeParse(
        request.body
      );

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Invalid comment data",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const comment =
      await updateComment(
        userId,
        commentId,
        parsed.data.content
      );

    response.status(200).json({
      success: true,
      data: {
        comment,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update comment";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}

export async function deleteCommentController(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { userId } =
      (request as AuthenticatedRequest).user;

    const commentId =
      request.params.commentId;

    if (typeof commentId !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });

      return;
    }

    await deleteComment(
      userId,
      commentId
    );

    response.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete comment";

    response.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
}