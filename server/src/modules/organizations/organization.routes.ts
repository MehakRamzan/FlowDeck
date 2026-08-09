import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  changeWorkspaceMemberRole,
  deleteWorkspace,
  removeWorkspaceMember,
  transferWorkspaceOwnership,
  updateWorkspace,
} from "./organization.controller.js";

const organizationRouter = Router();


organizationRouter.get(
  "/:organizationId/members",
  requireAuth,
  getWorkspaceMembers
);
organizationRouter.patch("/:organizationId/members/:memberId", requireAuth, changeWorkspaceMemberRole);
organizationRouter.delete("/:organizationId/members/:memberId", requireAuth, removeWorkspaceMember);
organizationRouter.post("/:organizationId/transfer-ownership", requireAuth, transferWorkspaceOwnership);
organizationRouter.patch("/:organizationId", requireAuth, updateWorkspace);
organizationRouter.delete("/:organizationId", requireAuth, deleteWorkspace);

organizationRouter.post("/", requireAuth, createWorkspace);
organizationRouter.get("/", requireAuth, getMyWorkspaces);
organizationRouter.get("/:organizationId", requireAuth, getWorkspaceById);

export default organizationRouter;
