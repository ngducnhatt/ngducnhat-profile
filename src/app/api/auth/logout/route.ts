import { NextResponse } from "next/server";

/**
 * API Đăng xuất: Xóa cookie auth_token.
 */
export async function POST() {
	const response = NextResponse.json({ message: "Đăng xuất thành công" });
	response.cookies.delete("auth_token");
	return response;
}
