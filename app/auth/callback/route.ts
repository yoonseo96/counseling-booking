import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getAdminNameForEmail } from "@/lib/auth";

// 구글 로그인 후 Supabase가 이 주소로 리다이렉트시키며 code를 실어줌.
// 여기서 code를 세션으로 교환하고, 허용된 이메일인지 확인함.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const response = NextResponse.redirect(new URL("/admin", req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: { name: string; value: string; options?: CookieOptions }[]) => {
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email;

  if (error || !email || !getAdminNameForEmail(email)) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("error", "not_allowed");
    response.headers.set("location", loginUrl.toString());
  }

  return response;
}
