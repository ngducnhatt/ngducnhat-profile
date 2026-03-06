import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Người dùng không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
