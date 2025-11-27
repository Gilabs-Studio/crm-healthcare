import { z } from "zod";
import type { TaskPriority, TaskStatus, TaskType } from "../types";

export const taskTypeValues: TaskType[] = ["general", "call", "email", "meeting", "follow_up"];

export const taskStatusValues: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export const taskPriorityValues: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be at most 255 characters"),
  description: z.string().optional(),
  type: z.enum(taskTypeValues).default("general"),
  priority: z.enum(taskPriorityValues).default("medium"),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
      },
      { message: "Invalid due date" }
    ),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
  account_id: z.string().uuid("Invalid account ID").optional().or(z.literal("")),
  contact_id: z.string().uuid("Invalid contact ID").optional().or(z.literal("")),
  deal_id: z.string().uuid("Invalid deal ID").optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be at most 255 characters")
    .optional(),
  description: z.string().optional(),
  type: z.enum(taskTypeValues).optional(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
      },
      { message: "Invalid due date" }
    ),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
  account_id: z.string().uuid("Invalid account ID").optional().or(z.literal("")),
  contact_id: z.string().uuid("Invalid contact ID").optional().or(z.literal("")),
  deal_id: z.string().uuid("Invalid deal ID").optional().or(z.literal("")),
});

export const assignTaskSchema = z.object({
  assigned_to: z
    .string()
    .min(1, "Assignee is required")
    .uuid("Invalid user ID"),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type AssignTaskFormData = z.infer<typeof assignTaskSchema>;


