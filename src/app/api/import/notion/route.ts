import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { parseCSV, parseNotionRow } from "@/lib/notion-parser";

const importBodySchema = z.object({
  csvContent: z.string().min(1, "CSV content is required"),
  defaultType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
  taskGroupId: z.string().optional(),
  timeChunkId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const parsed = importBodySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const { csvContent, defaultType, taskGroupId, timeChunkId } = parsed.data;

    const rows = parseCSV(csvContent);
    if (rows.length === 0) {
      return badRequest("No valid tasks found in the CSV file");
    }

    const parsedTasks = rows.map((row) =>
      parseNotionRow(row, { type: defaultType, taskGroupId, timeChunkId })
    );

    // Bulk create tasks
    const created = await prisma.$transaction(
      parsedTasks.map((task) => {
        const { consequence, ...taskData } = task;
        return prisma.task.create({
          data: {
            ...taskData,
            userId,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
            consequence: consequence ? { create: consequence } : undefined,
          },
          include: { consequence: true },
        });
      })
    );

    return NextResponse.json({
      imported: created.length,
      tasks: created,
    }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
