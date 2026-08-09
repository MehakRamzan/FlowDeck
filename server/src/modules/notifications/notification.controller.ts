import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { updateNotificationPreferencesSchema } from "./notification.schema.js";
import {
  getNotificationPreferences,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "./notification.service.js";

function userIdFrom(request: Request) {
  return (request as AuthenticatedRequest).user.userId;
}

export async function listNotifications(request: Request, response: Response) {
  const result = await getNotifications(userIdFrom(request));
  response.status(200).json({ success: true, data: result });
}

export async function readNotification(request: Request, response: Response) {
  try {
    const notificationId = request.params.notificationId;
    if (typeof notificationId !== "string") {
      response.status(400).json({ success: false, message: "Invalid notification ID" });
      return;
    }
    const notification = await markNotificationRead(userIdFrom(request), notificationId);
    response.status(200).json({ success: true, data: { notification } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update notification";
    response.status(message === "Notification not found" ? 404 : 500).json({ success: false, message });
  }
}

export async function readAllNotifications(request: Request, response: Response) {
  await markAllNotificationsRead(userIdFrom(request));
  response.status(200).json({ success: true, message: "Notifications marked as read" });
}

export async function showNotificationPreferences(request: Request, response: Response) {
  const preferences = await getNotificationPreferences(userIdFrom(request));
  response.status(200).json({ success: true, data: { preferences } });
}

export async function saveNotificationPreferences(request: Request, response: Response) {
  const parsed = updateNotificationPreferencesSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      success: false,
      message: "Invalid notification preferences",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const preferences = await updateNotificationPreferences(userIdFrom(request), parsed.data);
  response.status(200).json({ success: true, data: { preferences } });
}
