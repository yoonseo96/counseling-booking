import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// Vercel Cron이 매일 호출. CRON_SECRET을 env에 설정해두면 Vercel이 자동으로
// Authorization: Bearer <CRON_SECRET> 헤더를 붙여서 요청을 보낸다.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const retentionDays = Number(process.env.RETENTION_DAYS ?? "90");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .delete()
    .lt("session_at", cutoff.toISOString())
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: data?.length ?? 0 });
}
