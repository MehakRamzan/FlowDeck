import * as z from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name must contain at least 2 characters")
    .max(80, "Team name cannot exceed 80 characters"),

  organizationId: z
    .string()
    .min(1, "Organization ID is required"),
});

export const addTeamMemberSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required"),
});

export type AddTeamMemberInput = z.infer<
  typeof addTeamMemberSchema
>;

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: createTeamSchema.shape.name,
});
