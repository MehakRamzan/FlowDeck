import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  getProjectActivitiesController,
} from "./activity.controller.js";

const activityRouter = Router();

activityRouter.get(
  "/projects/:projectId",
  requireAuth,
  getProjectActivitiesController
);

export default activityRouter;