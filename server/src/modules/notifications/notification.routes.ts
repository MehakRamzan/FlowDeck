import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listNotifications,
  readAllNotifications,
  readNotification,
  saveNotificationPreferences,
  showNotificationPreferences,
} from "./notification.controller.js";

const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", listNotifications);
notificationRouter.patch("/read-all", readAllNotifications);
notificationRouter.get("/preferences", showNotificationPreferences);
notificationRouter.patch("/preferences", saveNotificationPreferences);
notificationRouter.patch("/:notificationId/read", readNotification);

export default notificationRouter;
