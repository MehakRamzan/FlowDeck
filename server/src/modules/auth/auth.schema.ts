import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),

  email: z.email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(80, "Name cannot exceed 80 characters")
      .optional(),
    email: z.email("Enter a valid email address").optional(),
    avatarUrl: z
      .union([z.url("Enter a valid avatar URL"), z.literal(""), z.null()])
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const forgotPasswordSchema = z.object({ email: z.email() });
export const resetPasswordSchema = z.object({ token: z.string().min(1), password: registerSchema.shape.password });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: registerSchema.shape.password });
export const verifyEmailSchema = z.object({ token: z.string().min(1) });
