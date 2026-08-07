import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  addTeamMemberController,
  createTeamController,
  getTeamByIdController,
  getTeamsController,
} from "./team.controller.js";

const teamRouter = Router();

teamRouter.post("/", requireAuth, createTeamController);

teamRouter.get(
  "/organization/:organizationId",
  requireAuth,
  getTeamsController
);

teamRouter.get("/:teamId", requireAuth, getTeamByIdController);

teamRouter.post(
  "/:teamId/members",
  requireAuth,
  addTeamMemberController
);

export default teamRouter;