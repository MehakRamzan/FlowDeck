import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  addTeamMemberController,
  createTeamController,
  getTeamByIdController,
  getTeamsController,
  deleteTeamController,
  removeTeamMemberController,
  updateTeamController,
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
teamRouter.patch("/:teamId", requireAuth, updateTeamController);
teamRouter.delete("/:teamId", requireAuth, deleteTeamController);
teamRouter.delete("/:teamId/members/:userId", requireAuth, removeTeamMemberController);

export default teamRouter;
