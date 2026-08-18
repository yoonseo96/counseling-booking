import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_NAME_HEADER, encodeAdminNameHeader, verifySession } from "@/lib/auth";

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
  const name = verifySession(cookie);

  if (name) {
    // 검증된 관리자 이름을 헤더로 실어서 이후 라우트 핸들러가 "누가 요청했는지" 알 수 있게 함.
    const headers = new Headers(req.headers);
    headers.set(ADMIN_NAME_HEADER, encodeAdminNameHeader(name));
    return NextResponse.next({ request: { headers } });
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
