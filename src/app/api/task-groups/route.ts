import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { createTaskGroupSchema } from "@/schemas/task-group";

export async function GET(_req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const taskGroups = await prisma.taskGroup.findMany({
      where: { userId },
      include: {
        timeChunk: { select: { id: true, name: true, color: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ taskGroups });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createTaskGroupSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const taskGroup = await prisma.taskGroup.create({
      data: { ...parsed.data, userId },
      include: {
        timeChunk: { select: { id: true, name: true, color: true } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ taskGroup }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
