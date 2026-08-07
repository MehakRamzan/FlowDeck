import * as z from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must contain at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Workspace URL must contain at least 2 characters")
    .max(60, "Workspace URL cannot exceed 60 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only"
    ),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;