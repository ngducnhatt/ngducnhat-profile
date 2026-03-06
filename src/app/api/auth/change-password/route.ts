import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

async function getUserId() {
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token")?.value;
	if (!token) return null;
	try {
		const { payload } = await jose.jwtVerify(token, JWT_SECRET);
		return payload.userId as string;
	} catch {
		return null;
	}
}

/**
 * API Đổi mật khẩu người dùng.
 */
export async function POST(req: Request) {
	try {
		const userId = await getUserId();
		if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

		const { oldPassword, newPassword } = await req.json();

		if (!oldPassword || !newPassword) {
			return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
		}

		// Tìm người dùng
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

		// Kiểm tra mật khẩu cũ
		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid) {
			return NextResponse.json({ message: "Mật khẩu cũ không chính xác" }, { status: 400 });
		}

		// Cập nhật mật khẩu mới
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});

		return NextResponse.json({ message: "Đã đổi mật khẩu thành công" }, { status: 200 });
	} catch (error) {
		console.error("Change Password Error:", error);
		return NextResponse.json({ message: "Đã xảy ra lỗi máy chủ" }, { status: 500 });
	}
}
