import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  createCommentController,
  deleteCommentController,
  getTaskCommentsController,
  updateCommentController,
} from "./comment.controller.js";

const commentRouter = Router();

commentRouter.post(
  "/tasks/:taskId",
  requireAuth,
  createCommentController
);

commentRouter.get(
  "/tasks/:taskId",
  requireAuth,
  getTaskCommentsController
);

commentRouter.patch(
  "/:commentId",
  requireAuth,
  updateCommentController
);

commentRouter.delete(
  "/:commentId",
  requireAuth,
  deleteCommentController
);

export default commentRouter;