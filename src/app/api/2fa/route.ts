import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { unstable_cache, revalidateTag } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

const getCached2FA = (userId: string) => 
  unstable_cache(
    async () => {
      return await prisma.twoFactor.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    [`2fa-${userId}`],
    { tags: [`2fa-${userId}`] }
  )();

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const items = await getCached2FA(userId);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const { label, secret } = await req.json();

    const newItem = await prisma.twoFactor.create({
      data: { label, secret, userId },
    });

    // @ts-ignore - Khắc phục lỗi Type mismatch trong phiên bản Next.js hiện tại
    revalidateTag(`2fa-${userId}`);
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
