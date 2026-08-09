import { z } from "zod";

export const createBoardColumnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Column name is required")
    .max(100, "Column name must be less than 100 characters"),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export const updateBoardColumnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Column name is required")
    .max(100, "Column name must be less than 100 characters")
    .optional(),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),
});

export const reorderBoardColumnsSchema = z.object({ columnIds: z.array(z.string()).min(1) });
