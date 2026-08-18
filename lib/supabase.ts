import { createClient } from "@supabase/supabase-js";

// 서버 코드(API 라우트, 서버 컴포넌트)에서만 import 할 것.
// service role 키는 RLS를 우회하므로 클라이언트 번들에 절대 포함되면 안 됨.
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export type Reservation = {
  id: string;
  name: string;
  session_at: string;
  location: string | null;
  place_url: string | null;
  memo: string | null;
  status: "confirmed" | "cancelled";
  consented: boolean;
  consented_at: string | null;
  created_at: string;
  created_by: string | null;
  cancelled_by: string | null;
};
