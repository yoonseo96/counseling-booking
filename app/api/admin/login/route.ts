import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, findAdminByPassword, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const admin = findAdminByPassword(password);
  if (!admin) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, name: admin.name });
  res.cookies.set(ADMIN_COOKIE_NAME, signSession(admin.name), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
