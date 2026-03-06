import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // 1. Chặn người dùng chưa đăng nhập
  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // 2. Chặn User vào Admin
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Đã đăng nhập thì không vào lại /login
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
