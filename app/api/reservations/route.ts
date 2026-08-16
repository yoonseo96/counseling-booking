import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// 관리자 전용: middleware.ts 에서 인증 체크됨.

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("session_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reservations: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const sessionAt = typeof body?.session_at === "string" ? body.session_at : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  const memo = typeof body?.memo === "string" ? body.memo.trim() : "";

  if (!name || !sessionAt) {
    return NextResponse.json({ error: "이름과 상담 일시는 필수입니다." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert({ name, session_at: sessionAt, location: location || null, memo: memo || null })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
