import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * API Đăng nhập: Hỗ trợ đăng nhập bằng Email hoặc Username.
 */
export async function POST(req: Request) {
	try {
		const { identifier, password } = await req.json();

		if (!identifier || !password) {
			return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
		}

		// Tìm người dùng bằng email HOẶC username
		const user = await prisma.user.findFirst({
			where: {
				OR: [{ email: identifier }, { username: identifier }],
			},
		});

		if (!user) {
			return NextResponse.json({ message: "Thông tin đăng nhập không chính xác" }, { status: 401 });
		}

		// Kiểm tra mật khẩu
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json({ message: "Thông tin đăng nhập không chính xác" }, { status: 401 });
		}

		// Tạo JWT Token
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: "7d" }
		);

		const response = NextResponse.json(
			{
				message: "Đăng nhập thành công",
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					name: user.name,
					role: user.role,
				},
			},
			{ status: 200 }
		);

		// Lưu token vào HTTP-only cookie để bảo mật
		response.cookies.set("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60, // 7 ngày
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login API Error:", error);
		return NextResponse.json({ message: "Đã xảy ra lỗi máy chủ" }, { status: 500 });
	}
}
