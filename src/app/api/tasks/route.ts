import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { createTaskSchema, taskQuerySchema } from "@/schemas/task";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const query = taskQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!query.success) {
      return badRequest("Invalid query parameters", query.error.flatten());
    }

    const { type, status, date, timeChunkId, taskGroupId, page, limit } = query.data;

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (timeChunkId) where.timeChunkId = timeChunkId;
    if (taskGroupId) where.taskGroupId = taskGroupId;

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          consequence: true,
          taskGroup: { select: { id: true, name: true, color: true } },
          timeChunk: { select: { id: true, name: true, color: true, startTime: true, endTime: true } },
          completions: date
            ? { where: { date: new Date(date) } }
            : { orderBy: { date: "desc" }, take: 1 },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const { consequence, ...taskData } = parsed.data;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        consequence: consequence
          ? { create: consequence }
          : undefined,
      },
      include: { consequence: true, taskGroup: true, timeChunk: true },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
