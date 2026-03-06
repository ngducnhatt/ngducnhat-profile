import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * API Đăng ký người dùng mới.
 */
export async function POST(req: Request) {
	try {
		const { email, username, password, name } = await req.json();

		if (!email || !username || !password) {
			return NextResponse.json({ message: "Vui lòng nhập đầy đủ các trường bắt buộc" }, { status: 400 });
		}

		// Kiểm tra Email hoặc Username đã tồn tại chưa
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existingUser) {
			const message =
				existingUser.email === email ? "Email này đã được sử dụng" : "Username này đã được sử dụng";
			return NextResponse.json({ message }, { status: 400 });
		}

		// Mã hóa mật khẩu
		const hashedPassword = await bcrypt.hash(password, 10);

		// Tạo người dùng mới
		const newUser = await prisma.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
				name: name || null,
				role: "USER", // Mặc định là USER
			},
		});

		return NextResponse.json(
			{
				message: "Đăng ký tài khoản thành công",
				user: {
					id: newUser.id,
					email: newUser.email,
					username: newUser.username,
					name: newUser.name,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Register API Error:", error);
		return NextResponse.json({ message: "Đã xảy ra lỗi máy chủ khi đăng ký" }, { status: 500 });
	}
}
