import { prisma } from "../../config/prisma.js";
import type { UpdateNotificationPreferencesInput } from "./notification.schema.js";

type NotificationCategory = "taskAssignments" | "comments";

type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  category: NotificationCategory;
};

export async function createNotification(input: CreateNotificationInput) {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId: input.userId },
  });

  if (preferences?.inApp === false || preferences?.[input.category] === false) {
    return null;
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });
}

export async function getNotifications(userId: string) {
  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) throw new Error("Notification not found");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: notification.readAt ?? new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getNotificationPreferences(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function updateNotificationPreferences(
  userId: string,
  input: UpdateNotificationPreferencesInput
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}
