"use client";

import { useState } from "react";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
}

export default function ConfirmClient({
  token,
  name,
  sessionAt,
  location,
  initialConsented,
}: {
  token: string;
  name: string;
  sessionAt: string;
  location: string | null;
  initialConsented: boolean;
}) {
  const [consented, setConsented] = useState(initialConsented);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/confirm/${token}`, { method: "POST" });

    setSubmitting(false);

    if (!res.ok) {
      setError("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setConsented(true);
  }

  return (
    <>
      <p>
        <strong>{name}</strong> 님, 아래 일정으로 상담이 예약되었습니다.
      </p>
      <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{formatDateTime(sessionAt)}</p>
      {location && <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>{location}</p>}

      {consented ? (
        <p className="muted">확인이 완료되었습니다. 감사합니다.</p>
      ) : (
        <>
          <ol className="notice-list">
            <li>바우처카드를 꼭 지참해주세요.</li>
            <li>당일취소는 불가합니다.</li>
          </ol>
          {error && <p className="error">{error}</p>}
          <button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "처리 중..." : "예약 확인"}
          </button>
        </>
      )}
    </>
  );
}
