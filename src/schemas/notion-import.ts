import { z } from "zod";
import { TaskTypeEnum, RecurrenceDayEnum } from "./task";

// Schema for a single Notion task row (CSV or JSON export)
export const notionTaskRowSchema = z.object({
  Name: z.string().min(1),
  Type: z.string().optional(),
  Status: z.string().optional(),
  Description: z.string().optional(),
  "Recurrence Days": z.string().optional(),
  "Estimated Minutes": z.string().optional(),
  "Due Date": z.string().optional(),
  "Time Chunk": z.string().optional(),
  "Task Group": z.string().optional(),
  Priority: z.string().optional(),
  Consequence: z.string().optional(),
  "Consequence Severity": z.string().optional(),
  "Notion ID": z.string().optional(),
  URL: z.string().url().optional(),
});

export const importNotionSchema = z.object({
  tasks: z.array(notionTaskRowSchema).min(1, "No tasks found in file"),
  defaultType: TaskTypeEnum.default("DAILY"),
  taskGroupId: z.string().cuid().optional(),
  timeChunkId: z.string().cuid().optional(),
});

// Parsed/normalized task from Notion
export const parsedNotionTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: TaskTypeEnum,
  priority: z.number().int().min(0).max(2).default(0),
  estimatedMins: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
  recurrenceDays: z.array(RecurrenceDayEnum).default([]),
  taskGroupId: z.string().cuid().optional(),
  timeChunkId: z.string().cuid().optional(),
  notionId: z.string().optional(),
  notionUrl: z.string().url().optional(),
  consequence: z
    .object({
      description: z.string(),
      severity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    })
    .optional(),
});

export type NotionTaskRow = z.infer<typeof notionTaskRowSchema>;
export type ImportNotionInput = z.infer<typeof importNotionSchema>;
export type ParsedNotionTask = z.infer<typeof parsedNotionTaskSchema>;
