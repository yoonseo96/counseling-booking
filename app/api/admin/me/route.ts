import { NextRequest, NextResponse } from "next/server";
import { getAdminNameFromHeaders } from "@/lib/auth";

// 관리자 전용: proxy.ts 에서 인증 체크되고, 검증된 이름이 헤더로 전달됨.
export async function GET(req: NextRequest) {
  const name = getAdminNameFromHeaders(req.headers);
  return NextResponse.json({ name });
}
