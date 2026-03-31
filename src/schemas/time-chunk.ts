import { z } from "zod";
import { RecurrenceDayEnum } from "./task";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeChunkBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex").default("#3B82F6"),
  startTime: z.string().regex(timeRegex, "Time must be HH:MM format"),
  endTime: z.string().regex(timeRegex, "Time must be HH:MM format"),
  days: z.array(RecurrenceDayEnum).min(1, "Select at least one day"),
  order: z.number().int().min(0).default(0),
});

export const createTimeChunkSchema = timeChunkBaseSchema.refine(
  (data) => data.startTime < data.endTime,
  { message: "End time must be after start time", path: ["endTime"] }
);

export const updateTimeChunkSchema = timeChunkBaseSchema.partial();

export type CreateTimeChunkInput = z.infer<typeof createTimeChunkSchema>;
export type UpdateTimeChunkInput = z.infer<typeof updateTimeChunkSchema>;
