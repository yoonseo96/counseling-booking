export const ADMIN_COOKIE_NAME = "admin_session";

export function getExpectedSessionToken(): string {
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!token) {
    throw new Error("ADMIN_SESSION_TOKEN 환경변수가 설정되지 않았습니다.");
  }
  return token;
}
