import { getSupabaseServerClient } from "@/lib/supabase";
import ConfirmClient from "./ConfirmClient";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!UUID_RE.test(token)) {
    return <NotFound />;
  }

  const supabase = getSupabaseServerClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, name, session_at, location, place_url, status, consented")
    .eq("id", token)
    .single();

  if (!reservation || reservation.status === "cancelled") {
    return <NotFound />;
  }

  return (
    <div className="page">
      <div className="card">
        <h1>예약 확인</h1>
        <ConfirmClient
          token={reservation.id}
          name={reservation.name}
          sessionAt={reservation.session_at}
          location={reservation.location}
          placeUrl={reservation.place_url}
          initialConsented={reservation.consented}
        />
      </div>
      <p className="muted" style={{ textAlign: "center" }}>
        <a href="/privacy">개인정보처리방침</a>
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <div className="card">
        <h1>예약 확인</h1>
        <p className="muted">유효하지 않거나 만료된 링크입니다. 담당자에게 문의해주세요.</p>
      </div>
    </div>
  );
}
