import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, badRequest, serverError } from "@/lib/api-helpers";
import { createTimeChunkSchema } from "@/schemas/time-chunk";

export async function GET(_req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const timeChunks = await prisma.timeChunk.findMany({
      where: { userId },
      include: {
        taskGroups: { select: { id: true, name: true, color: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: [{ order: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ timeChunks });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createTimeChunkSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const timeChunk = await prisma.timeChunk.create({
      data: { ...parsed.data, userId },
      include: { _count: { select: { tasks: true } } },
    });

    return NextResponse.json({ timeChunk }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
