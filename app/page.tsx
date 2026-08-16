import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page">
      <div className="card">
        <h1>상담 예약 확인 시스템</h1>
        <p className="muted">
          이 사이트는 상담 예약 링크를 확인하기 위한 페이지입니다. 예약 링크는 담당자가 카카오톡 등으로
          직접 전달해드립니다.
        </p>
        <p className="muted">관리자이신가요? <Link href="/admin">관리자 페이지로 이동</Link></p>
      </div>
      <div className="card">
        <Link href="/privacy">개인정보처리방침 보기</Link>
      </div>
    </div>
  );
}
