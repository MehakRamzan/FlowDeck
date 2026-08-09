import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  createTaskController,
  deleteTaskController,
  getColumnTasksController,
  getProjectTasksController,
  getTaskController,
  updateTaskController,
  moveTaskController,
} from "./task.controller.js";

const taskRouter = Router();

taskRouter.post(
  "/projects/:projectId/columns/:columnId",
  requireAuth,
  createTaskController
);

taskRouter.get(
  "/projects/:projectId",
  requireAuth,
  getProjectTasksController
);

taskRouter.get(
  "/columns/:columnId",
  requireAuth,
  getColumnTasksController
);

taskRouter.get(
  "/:taskId",
  requireAuth,
  getTaskController
);


taskRouter.patch(
  "/:taskId/move",
  requireAuth,
  moveTaskController
);

taskRouter.patch(
  "/:taskId",
  requireAuth,
  updateTaskController
);

taskRouter.delete(
  "/:taskId",
  requireAuth,
  deleteTaskController
);

export default taskRouter;