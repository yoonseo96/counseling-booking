import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_NAME_HEADER = "x-admin-name";

export type AdminUser = { name: string; password: string };

// ADMIN_USERS 예: [{"name":"장나겸","password":"..."},{"name":"동료","password":"..."}]
export function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (!raw) {
    throw new Error("ADMIN_USERS 환경변수가 설정되지 않았습니다.");
  }
  return JSON.parse(raw);
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

export function findAdminByPassword(password: string): AdminUser | null {
  const users = getAdminUsers();
  return users.find((u) => u.password === password) ?? null;
}

// 쿠키 값 = "이름.서명" — 서버만 아는 비밀값으로 서명해서, 쿠키를 조작해 다른 사람 이름을
// 사칭할 수 없게 함 (이름만 있고 서명이 없으면 위조 가능하기 때문).
export function signSession(name: string): string {
  const sig = createHmac("sha256", getSecret()).update(name).digest("hex");
  return `${encodeURIComponent(name)}.${sig}`;
}

export function verifySession(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encodedName = cookieValue.slice(0, dotIndex);
  const sig = cookieValue.slice(dotIndex + 1);
  const name = decodeURIComponent(encodedName);
  const expected = createHmac("sha256", getSecret()).update(name).digest("hex");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return name;
}

// HTTP 헤더는 ASCII만 담을 수 있어서, 한글 등 비-ASCII 이름은 encodeURIComponent로 인코딩해서 실어야 함.
export function encodeAdminNameHeader(name: string): string {
  return encodeURIComponent(name);
}

export function getAdminNameFromHeaders(headers: Headers): string | null {
  const raw = headers.get(ADMIN_NAME_HEADER);
  return raw ? decodeURIComponent(raw) : null;
}
