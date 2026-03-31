import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId, unauthorized, notFound, badRequest, serverError } from "@/lib/api-helpers";
import { updateTimeChunkSchema } from "@/schemas/time-chunk";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  try {
    const existing = await prisma.timeChunk.findFirst({ where: { id, userId } });
    if (!existing) return notFound("Time chunk");

    const body = await req.json();
    const parsed = updateTimeChunkSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const timeChunk = await prisma.timeChunk.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ timeChunk });
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
    const existing = await prisma.timeChunk.findFirst({ where: { id, userId } });
    if (!existing) return notFound("Time chunk");

    await prisma.timeChunk.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
