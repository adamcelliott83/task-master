import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { updateTaskSchema } from "@/schemas/task";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  try {
    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        consequence: true,
        taskGroup: true,
        timeChunk: true,
        completions: { orderBy: { date: "desc" }, take: 30 },
      },
    });

    if (!task) return notFound("Task");
    return NextResponse.json({ task });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return notFound("Task");

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const { consequence, ...taskData } = parsed.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
        consequence: consequence
          ? {
              upsert: {
                create: consequence,
                update: consequence,
              },
            }
          : undefined,
      },
      include: { consequence: true, taskGroup: true, timeChunk: true },
    });

    return NextResponse.json({ task });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return notFound("Task");

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
