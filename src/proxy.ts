import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "ngducnhat-secret-key-2026");

/**
 * Proxy (trước đây là Middleware) bảo vệ các tuyến đường /admin và /dashboard.
 * Đồng thời tự động chuyển hướng người dùng đã đăng nhập khi vào /login.
 */
export async function proxy(request: NextRequest) {
	const token = request.cookies.get("auth_token")?.value;
	const { pathname } = request.nextUrl;

	// 1. Nếu người dùng truy cập trang /login mà đã có token
	if (pathname === "/login") {
		if (token) {
			try {
				const { payload } = await jose.jwtVerify(token, JWT_SECRET);
				const role = payload.role as string;
				const redirectUrl = role === "ADMIN" ? "/admin" : "/dashboard";
				return NextResponse.redirect(new URL(redirectUrl, request.url));
			} catch (err) {
				// Token không hợp lệ, cho phép ở lại trang login
				return NextResponse.next();
			}
		}
		return NextResponse.next();
	}

	// 2. Bảo vệ các trang /admin và /dashboard
	if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
		if (!token) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		try {
			const { payload } = await jose.jwtVerify(token, JWT_SECRET);
			const userRole = payload.role as string;

			// Kiểm tra quyền Admin cho các trang /admin
			if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}

			return NextResponse.next();
		} catch (error) {
			// Token không hợp lệ hoặc hết hạn, xóa cookie và quay về login
			const response = NextResponse.redirect(new URL("/login", request.url));
			response.cookies.delete("auth_token");
			return response;
		}
	}

	return NextResponse.next();
}

// Cấu hình các đường dẫn áp dụng middleware/proxy
export const config = {
	matcher: ["/login", "/admin/:path*", "/dashboard/:path*"],
};
