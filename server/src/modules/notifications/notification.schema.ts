import { z } from "zod";

export const updateNotificationPreferencesSchema = z
  .object({
    taskAssignments: z.boolean().optional(),
    comments: z.boolean().optional(),
    inApp: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one preference is required",
  });

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
