"use client";

import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Reservation } from "@/lib/supabase";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DAYS_BEFORE = 7;
const DAYS_AFTER = 30;

function buildDateRange(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = -DAYS_BEFORE; i <= DAYS_AFTER; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function AdminPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [sessionAt, setSessionAt] = useState("");
  const [location, setLocation] = useState("범어역");
  const [memo, setMemo] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState("");
  const [loadError, setLoadError] = useState("");
  const [adminName, setAdminName] = useState("");
  const [dateRange] = useState<Date[]>(buildDateRange);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const selectedChipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedChipRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setAdminName(data.name ?? ""))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const res = await fetch("/api/reservations");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setLoadError(data.error ?? "예약 목록을 불러오지 못했습니다.");
      setReservations([]);
      setLoading(false);
      return;
    }
    setReservations(data.reservations ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setNewLink("");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        session_at: new Date(sessionAt).toISOString(),
        location,
        memo,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "예약 생성에 실패했습니다.");
      return;
    }

    const data = await res.json();
    setNewLink(`${window.location.origin}/confirm/${data.id}`);
    setName("");
    setSessionAt("");
    setMemo("");
    load();
  }

  async function handleCancel(id: string) {
    if (!confirm("이 예약을 취소 처리할까요?")) return;
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 예약 정보를 완전히 삭제할까요? 되돌릴 수 없습니다.")) return;
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    load();
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="page">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ marginBottom: 0 }}>예약 관리</h1>
        </div>
        {adminName && <p className="muted">{adminName} 님으로 로그인됨</p>}
        <button className="secondary" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className="card">
        <h2>새 예약 만들기</h2>
        <form onSubmit={handleCreate}>
          <label htmlFor="name">이름</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="sessionAt">상담 일시</label>
          <input
            id="sessionAt"
            type="datetime-local"
            value={sessionAt}
            onChange={(e) => setSessionAt(e.target.value)}
            required
          />

          <label htmlFor="location">상담 장소</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label htmlFor="memo">메모 (선택, 고객에게 보이지 않음)</label>
          <textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={creating}>
            {creating ? "생성 중..." : "예약 생성 및 링크 발급"}
          </button>
        </form>

        {newLink && (
          <div className="link-box">
            링크가 생성되었습니다. 이 링크를 복사해서 카카오톡으로 전달하세요.
            <br />
            <strong>{newLink}</strong>
          </div>
        )}
      </div>

      <div className="card">
        <h2>예약 목록</h2>

        <div className="date-slider">
          {dateRange.map((d, i) => {
            const key = toDateKey(d);
            const hasReservations = reservations.some((r) => toDateKey(new Date(r.session_at)) === key);
            const isSelected = key === selectedDate;
            const showMonthLabel = i === 0 || dateRange[i - 1].getMonth() !== d.getMonth();
            return (
              <Fragment key={key}>
                {showMonthLabel && <div className="date-month-label">{d.getMonth() + 1}월</div>}
                <button
                  type="button"
                  ref={isSelected ? selectedChipRef : undefined}
                  className={`date-chip ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <span className="date-chip-dow">{d.toLocaleDateString("ko-KR", { weekday: "short" })}</span>
                  <span className="date-chip-day">{d.getDate()}</span>
                  {hasReservations && <span className="date-chip-dot" />}
                </button>
              </Fragment>
            );
          })}
        </div>

        <p className="selected-date-heading">
          {fromDateKey(selectedDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>

        {loading && <p className="muted">불러오는 중...</p>}
        {!loading && loadError && <p className="error">{loadError}</p>}
        {!loading && !loadError && (
          <>
            {reservations.filter((r) => toDateKey(new Date(r.session_at)) === selectedDate).length === 0 && (
              <p className="muted">이 날짜에 예약이 없습니다.</p>
            )}
            {reservations
              .filter((r) => toDateKey(new Date(r.session_at)) === selectedDate)
              .map((r) => (
                <div className="reservation-item" key={r.id}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>{r.name}</strong>
                    <span
                      className={`badge ${r.status === "cancelled" ? "cancelled" : r.consented ? "" : "pending"}`}
                    >
                      {r.status === "cancelled" ? "취소됨" : r.consented ? "확인 완료" : "확인 대기"}
                    </span>
                  </div>
                  <p className="muted">
                    {formatTime(r.session_at)}
                    {r.location && ` · ${r.location}`}
                  </p>
                  {r.memo && <p className="muted">메모: {r.memo}</p>}
                  <div className="link-box">{`${typeof window !== "undefined" ? window.location.origin : ""}/confirm/${r.id}`}</div>
                  <div className="row">
                    {r.status !== "cancelled" && (
                      <button className="secondary" onClick={() => handleCancel(r.id)}>
                        취소 처리
                      </button>
                    )}
                    <button className="danger" onClick={() => handleDelete(r.id)}>
                      완전 삭제
                    </button>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
