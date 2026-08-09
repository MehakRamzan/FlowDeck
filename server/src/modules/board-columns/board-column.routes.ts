import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  createBoardColumnController,
  deleteBoardColumnController,
  getBoardColumnController,
  getProjectColumnsController,
  updateBoardColumnController,
  reorderBoardColumnsController,
} from "./board-column.controller.js";

const boardColumnRouter = Router();

boardColumnRouter.patch("/projects/:projectId/reorder", requireAuth, reorderBoardColumnsController);

boardColumnRouter.post(
  "/projects/:projectId",
  requireAuth,
  createBoardColumnController
);

boardColumnRouter.get(
  "/projects/:projectId",
  requireAuth,
  getProjectColumnsController
);

boardColumnRouter.get(
  "/:columnId",
  requireAuth,
  getBoardColumnController
);

boardColumnRouter.patch(
  "/:columnId",
  requireAuth,
  updateBoardColumnController
);

boardColumnRouter.delete(
  "/:columnId",
  requireAuth,
  deleteBoardColumnController
);

export default boardColumnRouter;
