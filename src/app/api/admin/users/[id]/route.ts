import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

async function checkAdmin() {
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token")?.value;
	if (!token) return false;
	try {
		const { payload } = await jose.jwtVerify(token, JWT_SECRET);
		return payload.role === "ADMIN";
	} catch {
		return false;
	}
}

/**
 * PATCH: Cập nhật thông tin người dùng (Inline Edit).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await checkAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	const { id } = await params;

	try {
		const body = await req.json();
		const user = await prisma.user.update({
			where: { id },
			data: {
				name: body.name,
				username: body.username,
				email: body.email,
				role: body.role,
			},
		});
		return NextResponse.json(user);
	} catch (error) {
		console.error("Update user error:", error);
		return NextResponse.json({ message: "Lỗi khi cập nhật người dùng" }, { status: 500 });
	}
}

/**
 * DELETE: Xóa người dùng.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await checkAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	const { id } = await params;

	try {
		await prisma.user.delete({ where: { id } });
		return NextResponse.json({ message: "User deleted" });
	} catch (error) {
		return NextResponse.json({ message: "Error" }, { status: 500 });
	}
}
