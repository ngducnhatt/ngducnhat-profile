import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { unstable_cache, revalidateTag } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

const getCachedUploads = (userId: string) => 
  unstable_cache(
    async () => {
      return await prisma.upload.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    [`uploads-${userId}`],
    { tags: [`uploads-${userId}`] }
  )();

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const uploads = await getCachedUploads(userId);
    return NextResponse.json(uploads);
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
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });

    // Giả lập lưu file
    const newUpload = await prisma.upload.create({
      data: {
        name: file.name,
        url: `https://pub-your-id.r2.dev/${file.name}`,
        type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        size: file.size,
        userId,
      },
    });

    // @ts-ignore - Khắc phục lỗi Type mismatch trong phiên bản Next.js hiện tại
    revalidateTag(`uploads-${userId}`);
    return NextResponse.json(newUpload);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
