import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { revalidateTag } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const { id } = await params;

    await prisma.upload.delete({
      where: { id, userId },
    });

    // @ts-ignore - Khắc phục lỗi Type mismatch trong phiên bản Next.js hiện tại
    revalidateTag(`uploads-${userId}`);

    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
