import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  getProjectDashboardController,
} from "./dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/projects/:projectId",
  requireAuth,
  getProjectDashboardController
);

export default dashboardRouter;