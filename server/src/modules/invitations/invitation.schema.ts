import * as z from "zod";

export const createInvitationSchema = z.object({
  email: z.email("Enter a valid email address"),

  organizationId: z
    .string()
    .min(1, "Organization ID is required"),

  role: z
    .enum(["ADMIN", "MEMBER"])
    .default("MEMBER"),
});

export type CreateInvitationInput = z.infer<
  typeof createInvitationSchema
>;

export const acceptInvitationSchema = z.object({
  token: z
    .string()
    .min(1, "Invitation token is required"),
});

export type AcceptInvitationInput = z.infer<
  typeof acceptInvitationSchema
>;