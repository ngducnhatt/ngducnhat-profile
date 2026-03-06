import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { unstable_cache, revalidateTag } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

// Hàm lấy dữ liệu có Cache - Chỉ gọi DB khi tag "user-notes-[userId]" bị xóa
const getCachedNotes = (userId: string) => 
  unstable_cache(
    async () => {
      return await prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    [`notes-${userId}`],
    { tags: [`notes-${userId}`] }
  )();

/**
 * GET: Lấy danh sách ghi chú (Sử dụng Cache tuyệt đối)
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const notes = await getCachedNotes(userId);
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

/**
 * POST: Tạo ghi chú mới (Xóa cache để cập nhật DB)
 */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const { title, content } = await req.json();

    const newNote = await prisma.note.create({
      data: { title, content, userId },
    });

    // Xóa cache thống kê và danh sách ghi chú
    // @ts-ignore
    (revalidateTag as any)(`stats-${userId}`);
    // @ts-ignore
    (revalidateTag as any)(`notes-${userId}`);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
