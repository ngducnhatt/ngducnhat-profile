import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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
 * GET: Lấy danh sách người dùng.
 */
export async function GET() {
	if (!(await checkAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				username: true,
				name: true,
				role: true,
				createdAt: true,
			},
			orderBy: { createdAt: "asc" },
		});
		return NextResponse.json(users);
	} catch (error) {
		return NextResponse.json({ message: "Error" }, { status: 500 });
	}
}

/**
 * POST: Admin tạo người dùng mới.
 */
export async function POST(req: Request) {
	if (!(await checkAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

	try {
		const { email, username, password, name, role } = await req.json();
		
		const existing = await prisma.user.findFirst({
			where: { OR: [{ email }, { username }] }
		});

		if (existing) {
			return NextResponse.json({ message: "Email hoặc Username đã tồn tại" }, { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password || "123456", 10);
		const user = await prisma.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
				name: name || null,
				role: role || "USER",
			},
		});

		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		return NextResponse.json({ message: "Error creating user" }, { status: 500 });
	}
}
