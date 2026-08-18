"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function LoginForm() {
  const searchParams = useSearchParams();
  const notAllowed = searchParams.get("error") === "not_allowed";
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="card">
      <h1>관리자 로그인</h1>
      {notAllowed && (
        <p className="error">허용되지 않은 계정입니다. 관리자에게 문의해주세요.</p>
      )}
      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "이동 중..." : "Google로 로그인"}
      </button>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="page">
      <Suspense fallback={<div className="card" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
