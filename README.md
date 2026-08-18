# 상담 예약 확인 시스템

관리자가 예약을 등록하면 추측 불가능한 링크(`/confirm/{uuid}`)가 생성되고, 그 링크를 카카오톡으로 직접 붙여넣어 전달하는 방식입니다. 고객은 링크에서 이름·상담일시를 확인하고 개인정보 수집·이용에 동의합니다.

## 1. Supabase 설정 (무료)

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. 왼쪽 메뉴 **SQL Editor** 에서 아래 SQL 실행

```sql
create extension if not exists pgcrypto;

create table reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_at timestamptz not null,
  location text,
  memo text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  consented boolean not null default false,
  consented_at timestamptz,
  created_at timestamptz not null default now(),
  created_by text,
  cancelled_by text
);

-- 서버(service role 키)에서만 접근하고 클라이언트는 직접 접근하지 않으므로
-- RLS를 켜고 별도 정책은 만들지 않아 기본적으로 모든 직접 접근을 차단합니다.
alter table reservations enable row level security;
```

3. **Project Settings > API** 에서 아래 두 값을 복사해둡니다.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` 키 (secret) → `SUPABASE_SERVICE_ROLE_KEY` — **이 키는 절대 외부에 노출되면 안 됩니다.**

## 2. 로컬 환경변수 설정

`.env.local.example` 파일을 복사해서 `.env.local` 로 만들고 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

- `ADMIN_USERS`: 관리자 이름·비밀번호 목록 (JSON). 관리자별로 로그인이 분리되고, 각자 본인이 만든 예약만 볼 수 있습니다.
- `ADMIN_SESSION_SECRET`, `CRON_SECRET`: 아래 명령으로 랜덤 문자열을 생성해서 각각 다르게 넣으세요.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000/admin` 으로 접속해 비밀번호 로그인 후 예약을 만들어보세요.

## 4. 배포 (Vercel, 무료)

1. 이 프로젝트를 GitHub 저장소로 올립니다 (`.env.local`은 `.gitignore`에 포함되어 있어 올라가지 않습니다).
2. [vercel.com](https://vercel.com) 에서 New Project → 방금 만든 저장소 선택
3. **Environment Variables** 에 `.env.local`에 넣었던 값들을 동일하게 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERS`
   - `ADMIN_SESSION_SECRET`
   - `CRON_SECRET`
   - `RETENTION_DAYS` (예: `90`)
4. Deploy. 배포되면 `https://프로젝트명.vercel.app` 주소가 생기고 자동으로 HTTPS가 적용됩니다.
5. `vercel.json`에 정의된 Cron이 자동으로 매일 오래된 예약(상담일 + 보관기간 경과)을 삭제합니다. Vercel 대시보드의 **Settings > Cron Jobs** 에서 정상 등록됐는지 확인하세요. (Hobby 무료 플랜은 크론이 하루 1회로 제한됩니다.)

참고: `/admin`에서 "확인 대기" 상태인 예약을 보고 직접 "취소 처리"를 눌러야 실제로 취소됩니다. 자동으로 취소되진 않습니다.

## 5. 실제 사용 흐름

1. `/admin` 접속 → 비밀번호 로그인
2. "새 예약 만들기"에 고객 이름 · 상담 일시 입력 후 생성
3. 생성된 `https://.../confirm/{uuid}` 링크를 복사해 카카오톡으로 고객에게 직접 전달
4. 고객이 링크를 열어 이름·일시 확인 후 동의 체크박스 → "예약 확인" 클릭
5. `/admin`의 예약 목록에서 "동의 완료" 여부 확인 가능. 취소 시 "취소 처리", 완전히 지우려면 "완전 삭제"

## 6. 관리자 2인 이상 운영

- `ADMIN_USERS`에 이름·비밀번호를 추가하면 인원을 늘릴 수 있습니다.
- 각 관리자는 로그인 비밀번호로 서로 구분되고, `/admin`에서는 **본인이 만든 예약만** 보이고 취소·삭제도 본인 것만 가능합니다 (다른 관리자의 상담 내역은 API로 직접 요청해도 조회되지 않습니다).
- 특정 인원의 접근을 막고 싶으면 `ADMIN_USERS`에서 그 사람 항목만 지우고 재배포하면 됩니다. 그 사람이 만든 예약은 삭제되지 않고 남아있습니다 (다만 그 예약을 만든 사람이 없어졌으므로 관리자 화면에서 아무도 못 보게 됩니다 — 필요하면 Supabase Table Editor에서 직접 확인/이관하세요).

## 7. 참고

- `/privacy` 페이지의 담당자 정보는 [app/privacy/page.tsx](app/privacy/page.tsx)에 반영되어 있습니다. 정보가 바뀌면 이 파일만 수정하면 됩니다.
- 저는 변호사가 아니라 법적 판단(민감정보 해당 여부 등)이 필요하면 개인정보보호위원회(privacy.go.kr) 상담이나 전문가 확인을 받는 걸 권장합니다.
