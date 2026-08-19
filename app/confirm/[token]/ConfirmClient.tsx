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

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: -2, marginRight: 4 }}
    >
      <path
        d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.72 11.34 7.05 11.63a1.5 1.5 0 0 0 1.9 0C13.28 21.34 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
        fill="#03C75A"
      />
    </svg>
  );
}

export default function ConfirmClient({
  token,
  name,
  sessionAt,
  location,
  placeUrl,
  createdBy,
  initialConsented,
}: {
  token: string;
  name: string;
  sessionAt: string;
  location: string | null;
  placeUrl: string | null;
  createdBy: string | null;
  initialConsented: boolean;
}) {
  const [consented, setConsented] = useState(initialConsented);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const noticeItems =
    createdBy === "이혜진"
      ? ["바우처카드를 꼭 지참해주세요.", "원활한 예약 운영을 위해 취소 및 변경은 하루 전까지 부탁드릴게요.♡"]
      : ["바우처카드를 꼭 지참해주세요.", "당일취소는 불가합니다."];

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
        <strong>{name}</strong>님의 예약일정은 아래와 같습니다.
      </p>

      <div className="schedule-box">
        <p style={{ fontSize: 18, fontWeight: 600 }}>{formatDateTime(sessionAt)}</p>
        {location && (
          <p className="muted" style={{ fontSize: 13 }}>
            {location}
          </p>
        )}
        {consented && placeUrl && (
          <p style={{ fontSize: 13 }}>
            <a href={placeUrl} target="_blank" rel="noopener noreferrer">
              <PinIcon />
              네이버 플레이스에서 위치 보기
            </a>
          </p>
        )}
      </div>

      {consented ? (
        <p style={{ fontSize: 16, fontWeight: 600 }}>예약 확인이 완료되었습니다. 감사합니다.</p>
      ) : (
        <>
          <ol className="notice-list">
            {noticeItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
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
