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

export const updateOrganizationSchema = z.object({
  name: createOrganizationSchema.shape.name.optional(),
  slug: createOrganizationSchema.shape.slug.optional(),
  preferences: z.object({
    timezone: z.string().trim().min(1).max(80).optional(),
    weekStartsOn: z.enum(["sunday", "monday"]).optional(),
    dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
  }).optional(),
}).refine((value) => Object.keys(value).length > 0, { message: "At least one workspace field is required" });

export const transferOwnershipSchema = z.object({ userId: z.string().min(1) });
export const updateMemberRoleSchema = z.object({ role: z.enum(["ADMIN", "MEMBER"]) });
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
