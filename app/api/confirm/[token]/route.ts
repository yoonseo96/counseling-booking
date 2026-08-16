import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 고객이 확인 페이지에서 동의 체크 후 호출하는 공개 API. 링크(UUID)를 아는 사람만 접근 가능.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!UUID_RE.test(token)) {
    return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ consented: true, consented_at: new Date().toISOString() })
    .eq("id", token)
    .eq("status", "confirmed")
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
