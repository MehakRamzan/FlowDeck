import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),

  assigneeId: z
    .string()
    .optional()
    .nullable(),

  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),

  assigneeId: z
    .string()
    .optional()
    .nullable(),

  columnId: z
    .string()
    .optional(),

  dueDate: z.coerce.date().optional().nullable(),
});

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  targetPosition: z.number().int().min(0),
});
