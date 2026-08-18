export const ADMIN_NAME_HEADER = "x-admin-name";

export type AdminAllowlistEntry = { email: string; name: string };

// ADMIN_ALLOWLIST 예: [{"email":"a@gmail.com","name":"장나겸"},{"email":"b@gmail.com","name":"이혜진"}]
// 여기 없는 구글 계정은 로그인에 성공해도 관리자 페이지에 들어올 수 없음.
function getAllowlist(): AdminAllowlistEntry[] {
  const raw = process.env.ADMIN_ALLOWLIST;
  if (!raw) {
    throw new Error("ADMIN_ALLOWLIST 환경변수가 설정되지 않았습니다.");
  }
  return JSON.parse(raw);
}

export function getAdminNameForEmail(email: string): string | null {
  const entry = getAllowlist().find((e) => e.email.toLowerCase() === email.toLowerCase());
  return entry?.name ?? null;
}

// HTTP 헤더는 ASCII만 담을 수 있어서, 한글 등 비-ASCII 이름은 encodeURIComponent로 인코딩해서 실어야 함.
export function encodeAdminNameHeader(name: string): string {
  return encodeURIComponent(name);
}

export function getAdminNameFromHeaders(headers: Headers): string | null {
  const raw = headers.get(ADMIN_NAME_HEADER);
  return raw ? decodeURIComponent(raw) : null;
}
