import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAdminNameFromHeaders } from "@/lib/auth";

// 관리자 전용: proxy.ts 에서 인증 체크됨.
// created_by로 필터링해서, 로그인한 관리자가 본인이 만든 예약만 조회/취소/삭제할 수 있게 함
// (다른 관리자의 상담 내역은 API로 직접 요청해도 접근 불가).

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (status !== "confirmed" && status !== "cancelled") {
    return NextResponse.json({ error: "status 값이 올바르지 않습니다." }, { status: 400 });
  }

  const adminName = getAdminNameFromHeaders(req.headers);
  const update = status === "cancelled" ? { status, cancelled_by: adminName } : { status };

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .update(update)
    .eq("id", id)
    .eq("created_by", adminName)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminName = getAdminNameFromHeaders(req.headers);

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id)
    .eq("created_by", adminName)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
