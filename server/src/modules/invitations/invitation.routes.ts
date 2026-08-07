import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  acceptInvitationController,
  createInvitationController,
} from "./invitation.controller.js";

const invitationRouter = Router();

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