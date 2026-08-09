import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  getTeamProjectsController,
  updateProjectController,
} from "./project.controller.js";

const projectRouter = Router();

projectRouter.post(
  "/teams/:teamId",
  requireAuth,
  createProjectController
);

projectRouter.get(
  "/teams/:teamId",
  requireAuth,
  getTeamProjectsController
);

projectRouter.get(
  "/:projectId",
  requireAuth,
  getProjectController
);

projectRouter.patch(
  "/:projectId",
  requireAuth,
  updateProjectController
);

projectRouter.delete(
  "/:projectId",
  requireAuth,
  deleteProjectController
);

export default projectRouter;