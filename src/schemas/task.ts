import { z } from "zod";

export const TaskTypeEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
export const TaskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED", "FAILED"]);
export const ConsequenceSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const RecurrenceDayEnum = z.enum([
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
]);

export const consequenceSchema = z.object({
  description: z.string().min(1, "Consequence description is required"),
  severity: ConsequenceSeverityEnum.default("MEDIUM"),
  isActive: z.boolean().default(true),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title too long"),
  description: z.string().max(1000).optional(),
  type: TaskTypeEnum,
  priority: z.number().int().min(0).max(2).default(0),
  estimatedMins: z.number().int().positive().optional(),
  dueDate: z.string().datetime().optional(),
  recurrenceDays: z.array(RecurrenceDayEnum).optional().default([]),
  weekOfMonth: z.number().int().min(1).max(4).optional(),
  taskGroupId: z.string().cuid().optional(),
  timeChunkId: z.string().cuid().optional(),
  consequence: consequenceSchema.optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: TaskStatusEnum.optional(),
  completedAt: z.string().datetime().optional(),
});

export const taskQuerySchema = z.object({
  type: TaskTypeEnum.optional(),
  status: TaskStatusEnum.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  timeChunkId: z.string().cuid().optional(),
  taskGroupId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type ConsequenceInput = z.infer<typeof consequenceSchema>;
