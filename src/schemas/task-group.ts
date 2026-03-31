import { z } from "zod";

export const createTaskGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex").default("#6366F1"),
  timeChunkId: z.string().cuid().optional(),
  order: z.number().int().min(0).default(0),
});

export const updateTaskGroupSchema = createTaskGroupSchema.partial();

export type CreateTaskGroupInput = z.infer<typeof createTaskGroupSchema>;
export type UpdateTaskGroupInput = z.infer<typeof updateTaskGroupSchema>;
