import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound, badRequest, serverError } from "@/lib/api-helpers";

const completeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["COMPLETED", "FAILED", "SKIPPED"]),
  notes: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  try {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return notFound("Task");

    const body = await req.json();
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const { date, status, notes } = parsed.data;
    const dateObj = new Date(date);

    const completion = await prisma.taskCompletion.upsert({
      where: { taskId_date: { taskId: id, date: dateObj } },
      create: {
        taskId: id,
        userId,
        status,
        date: dateObj,
        notes,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      update: {
        status,
        notes,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    // Update the task's main status for non-recurring tasks
    if (task.type === "DAILY" && task.recurrenceDays.length === 0) {
      await prisma.task.update({
        where: { id },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ completion });
  } catch (error) {
    return serverError(error);
  }
}
