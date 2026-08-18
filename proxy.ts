import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { ADMIN_NAME_HEADER, encodeAdminNameHeader, getAdminNameForEmail } from "@/lib/auth";

// /admin 페이지와 예약 관리 API는 구글 로그인(Supabase Auth) 세션이 있어야 접근 가능.
// 로그인한 구글 계정이라도 ADMIN_ALLOWLIST에 없으면 접근 불가.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi = pathname.startsWith("/api/reservations") || pathname.startsWith("/api/admin");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const cookiesToForward: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) => {
          toSet.forEach((c) => cookiesToForward.push(c));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = user?.email ? getAdminNameForEmail(user.email) : null;

  let response: NextResponse;

  if (name) {
    // 검증된 관리자 이름을 헤더로 실어서 이후 라우트 핸들러가 "누가 요청했는지" 알 수 있게 함.
    const headers = new Headers(req.headers);
    headers.set(ADMIN_NAME_HEADER, encodeAdminNameHeader(name));
    response = NextResponse.next({ request: { headers } });
  } else if (isProtectedApi) {
    response = NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } else {
    response = NextResponse.redirect(new URL("/admin/login", req.url));
  }

  cookiesToForward.forEach(({ name: cName, value, options }) => {
    response.cookies.set(cName, value, options);
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/reservations/:path*", "/api/admin/:path*"],
};
