import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, serverError } from "@/lib/api-helpers";

const statsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
});

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const query = statsQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const today = query.data.date ? new Date(query.data.date) : new Date();
    today.setHours(0, 0, 0, 0);

    const taskWhere: Record<string, unknown> = { userId };
    if (query.data.type) taskWhere.type = query.data.type;

    const [totalTasks, completedToday, failedToday, pendingToday] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.taskCompletion.count({
        where: { userId, status: "COMPLETED", date: today },
      }),
      prisma.taskCompletion.count({
        where: { userId, status: "FAILED", date: today },
      }),
      prisma.taskCompletion.count({
        where: { userId, status: "PENDING", date: today },
      }),
    ]);

    const tasksForDate = await prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: "FAILED" },
      },
    });

    const completionPercent =
      tasksForDate > 0 ? Math.round((completedToday / tasksForDate) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalTasks,
        tasksForDate,
        completedToday,
        failedToday,
        pendingToday,
        completionPercent,
        date: today.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
