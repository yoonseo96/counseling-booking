import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

// /admin 페이지와 예약 관리 API는 관리자 세션 쿠키가 있어야 접근 가능.
// 로그인 자체(/admin/login, /api/admin/login)는 통과시켜야 함.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi =
    (pathname.startsWith("/api/reservations") || pathname.startsWith("/api/admin")) &&
    pathname !== "/api/admin/login";

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const authed = Boolean(cookie && expected && cookie === expected);

  if (authed) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/reservations/:path*", "/api/admin/:path*"],
};
