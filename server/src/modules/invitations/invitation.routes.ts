import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  acceptInvitationController,
  createInvitationController,
  previewInvitationController,
  listInvitationsController,
  resendInvitationController,
  revokeInvitationController,
} from "./invitation.controller.js";

const invitationRouter = Router();

invitationRouter.get("/organization/:organizationId", requireAuth, listInvitationsController);
invitationRouter.post("/:invitationId/resend", requireAuth, resendInvitationController);
invitationRouter.delete("/:invitationId", requireAuth, revokeInvitationController);

invitationRouter.get(
  "/preview/:token",
  previewInvitationController
);

invitationRouter.post(
  "/accept",
  requireAuth,
  acceptInvitationController
);

invitationRouter.post(
  "/",
  requireAuth,
  createInvitationController
);

export default invitationRouter;
