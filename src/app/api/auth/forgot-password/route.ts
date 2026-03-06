import { prisma } from "@/lib/prisma";
import { sendNewPasswordEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * API Quên mật khẩu: Tạo mật khẩu mới và gửi về email.
 */
export async function POST(req: Request) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json({ message: "Vui lòng nhập Email" }, { status: 400 });
		}

		// 1. Kiểm tra người dùng
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			// Vì bảo mật, ta có thể trả về thông báo "Nếu email tồn tại..." nhưng ở đây 
			// để dễ sử dụng, ta sẽ báo rõ là email không tồn tại.
			return NextResponse.json({ message: "Không tìm thấy người dùng với email này" }, { status: 404 });
		}

		// 2. Tạo mật khẩu mới ngẫu nhiên (8 ký tự alphanumeric)
		const newPassword = crypto.randomBytes(4).toString("hex").toUpperCase();

		// 3. Hash mật khẩu mới và cập nhật DB
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { email },
			data: { password: hashedPassword },
		});

		// 4. Gửi mail chứa mật khẩu mới (plain text)
		try {
			await sendNewPasswordEmail(email, newPassword);
		} catch (mailError) {
			console.error("Gửi mail thất bại:", mailError);
			return NextResponse.json({ message: "Đã xảy ra lỗi khi gửi email khôi phục" }, { status: 500 });
		}

		return NextResponse.json(
			{ message: "Mật khẩu mới đã được gửi tới email của bạn thành công" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Forgot Password API Error:", error);
		return NextResponse.json({ message: "Đã xảy ra lỗi máy chủ" }, { status: 500 });
	}
}
