export default function PrivacyPage() {
  const retentionDays = process.env.RETENTION_DAYS ?? "90";

  return (
    <div className="page">
      <div className="card">
        <h1>개인정보처리방침</h1>

        <h2>1. 수집하는 개인정보 항목</h2>
        <p className="muted">이름, 상담 희망 일시. 그 외 항목은 수집하지 않습니다.</p>

        <h2>2. 수집 및 이용 목적</h2>
        <p className="muted">상담 예약 확인 및 일정 관리 목적으로만 사용하며, 다른 목적으로 이용하지 않습니다.</p>

        <h2>3. 보유 및 이용 기간</h2>
        <p className="muted">
          상담 종료일로부터 {retentionDays}일이 경과하면 별도 요청 없이 자동으로 파기됩니다.
        </p>

        <h2>4. 제3자 제공</h2>
        <p className="muted">수집한 개인정보는 원칙적으로 외부에 제공하지 않습니다.</p>

        <h2>5. 개인정보 보호책임자</h2>
        <p className="muted">
          장나겸 · 010-2623-0803
          <br />
          개인정보 관련 문의는 위 연락처로 해주시기 바랍니다.
        </p>

        <h2>6. 이용자의 권리</h2>
        <p className="muted">
          이용자는 언제든지 본인의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다. 위 연락처로 요청해주세요.
        </p>
      </div>
    </div>
  );
}
