import { createBrowserClient } from "@supabase/ssr";

// 클라이언트 컴포넌트에서만 사용. anon(publishable) 키는 브라우저에 노출돼도 되는 키.
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
