import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
} from "./organization.controller.js";

const organizationRouter = Router();


organizationRouter.get(
  "/:organizationId/members",
  requireAuth,
  getWorkspaceMembers
);

organizationRouter.post("/", requireAuth, createWorkspace);
organizationRouter.get("/", requireAuth, getMyWorkspaces);
organizationRouter.get("/:organizationId", requireAuth, getWorkspaceById);

export default organizationRouter;