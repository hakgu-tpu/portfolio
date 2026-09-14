---
title: 아키텍처
status: 확정 (프론트엔드 스택 포함)
---

# 아키텍처

관련 문서: [[data-model]] · [[decisions]] · [[content-operations]]

## 전체 구조 — 읽기/쓰기 분리

```
┌─────────────────────────────────────────┐
│           Supabase 대시보드              │
│      (본인만 접근하는 관리 화면)          │
│                                         │
│  Table Editor에서 직접 수정              │
│  • 프로젝트 추가/수정/삭제               │
│  • 수상 내역 추가                        │
│  • 기술 스택 업데이트                    │
│  (service_role 권한으로 RLS 우회)        │
└──────────────────┬──────────────────────┘
                   │ 데이터 반영
                   ↓
┌─────────────────────────────────────────┐
│         Supabase Postgres DB             │
│   (schema.sql = 이 프로젝트의 source of  │
│    truth, RLS 로 공개 읽기 / 제한 쓰기)   │
└──────────────────┬──────────────────────┘
                   │ anon key, 읽기 전용 쿼리
                   ↓
┌─────────────────────────────────────────┐
│        포트폴리오 사이트 (정적 HTML)      │
│     (도메인 — 누구나 접근 가능)           │
│                                         │
│  데이터 조회만 → 화면에 렌더링           │
│  쓰기 권한 없음 (RLS 로 차단)             │
└─────────────────────────────────────────┘
```

### 이 구조를 택한 이유
- 별도 어드민 페이지를 만들지 않아도 됨 → 개발 공수 절감 (Supabase Table Editor가 이미 스프레드시트처럼 편함)
- 코드 배포 없이 DB만 수정하면 사이트에 즉시 반영
- 사이트 자체에 쓰기 권한이 없어 외부 공격 표면이 줄어듦 (RLS로 anon 역할은 read-only)
- 트레이드오프: 콘텐츠를 추가할 때마다 Supabase 대시보드에 직접 들어가야 함, 이미지 업로드는 별도 Storage 연동 필요

## Supabase 프로젝트 최초 세팅

1. [supabase.com](https://supabase.com) → New Project 생성
2. 생성 옵션에서:

   | 옵션 | 선택 | 이유 |
   |---|---|---|
   | Enable Data API | 켜기 | `@supabase/supabase-js` 가 PostgREST 기반 Data API로 조회함 — 꺼지면 사이트가 데이터를 못 가져옴 |
   | Automatically expose new tables | **끄기** | 새 테이블에 권한이 암묵적으로 자동 부여되는 것을 막기 위함. 대신 `schema.sql`에 테이블별 `grant` 문을 명시함 ([[decisions#adr-006]]) |
   | Enable automatic RLS | 켜기 | RLS를 깜빡 켜지 않은 테이블이 생기는 걸 막는 안전망. `schema.sql`이 이미 테이블마다 명시적으로 RLS를 켜므로 무해함 |

3. **SQL Editor → New query** 에서 `supabase/schema.sql` 전체 내용을 실행 (테이블 + RLS + grant + seed data 한 번에 생성)
4. **Project Settings → API** 에서 Project URL과 `anon public` key를 복사해 `.env.local` (← `.env.local.example` 참고)에 채워 넣기
5. `service_role` key는 절대 사이트 코드/커밋에 포함하지 않음 — Supabase 대시보드 로그인에만 사용

## 기술 스택

| 영역 | 선택 | 상태 |
|---|---|---|
| 포트폴리오 형식 | 웹사이트 (HTML) | ✅ 확정 |
| 데이터베이스 | Supabase (Postgres) | ✅ 확정 |
| 접근 제어 | Row Level Security (public read / authenticated write / contacts는 public insert) | ✅ 확정 |
| 프론트엔드 프레임워크 | React 19 + Vite (TypeScript) | ✅ 확정 |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) | ✅ 확정 |
| 라우팅 | react-router-dom (`/`, `/projects/:id`) | ✅ 확정 |
| DB 클라이언트 | `@supabase/supabase-js` (anon key만 사용) | ✅ 확정 |
| 린트 | oxlint | ✅ 확정 (create-vite 기본값 채택) |
| 배포 | GitHub (private repo) → Cloudflare Pages 자동 빌드/배포 | ✅ 확정 |
| 이미지 저장소 | Supabase Storage (예정) | ⏳ 미착수 (추후 진행) |

> **주의**: "미정/미착수" 항목은 아직 사용자 확정을 받지 않은 상태입니다. Claude Code가 향후
> 세션에서 이 항목들을 "이미 정해진 것"처럼 다루지 말고, 실제 착수 전에 재확인하세요.

## 프론트엔드 구조

```
src/
  main.tsx             # 엔트리, BrowserRouter 세팅
  App.tsx              # 라우트 정의 (/, /projects/:id)
  lib/supabase.ts       # Supabase 클라이언트 (anon key)
  types/database.ts     # schema.sql 과 1:1 대응하는 타입 — 스키마 변경 시 함께 갱신
  pages/Home.tsx        # 프로젝트 목록 + skills/awards/experiences 섹션
  pages/ProjectDetail.tsx  # 프로젝트 상세 (project_details, project_skills join)
  components/ProjectCard.tsx
```

`src/types/database.ts` 는 [[data-model]] / `supabase/schema.sql` 과 동기화되어야 하는 파일입니다.
테이블 컬럼을 바꾸면 이 파일도 함께 수정하세요.

로컬 개발 시 `.env.local.example` 을 복사해 `.env.local` 을 만들고 Supabase 프로젝트의 URL/anon key를
채워 넣습니다 (`.env.local` 은 `.gitignore` 의 `*.local` 규칙으로 커밋되지 않음).

## 환경 변수 (프론트엔드 확정 시 필요)

사이트는 Supabase **anon key** 만 사용합니다 (RLS가 쓰기를 막으므로 클라이언트에 노출돼도 안전).
service_role key는 절대 클라이언트/사이트 코드에 포함하지 않습니다 — 오직 Supabase 대시보드 접근에만 사용.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 배포 — GitHub → Cloudflare Pages

1. 코드는 GitHub private 저장소(`hakgu-tpu/portfolio`)에 push
2. Cloudflare Pages 프로젝트를 이 저장소에 연결 (Framework preset: **Vite**, Build command: `npm run build`,
   Build output directory: `dist`)
3. Cloudflare Pages 프로젝트 **Settings → Environment variables** 에 아래 두 값 등록
   (`.env.local`은 커밋되지 않으므로 별도 등록 필요):
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```
4. `main` 브랜치에 push 할 때마다 Cloudflare Pages가 자동으로 빌드·배포
5. SPA 라우팅 대응: 이 프로젝트에 연결된 Cloudflare Pages는 내부적으로 Workers + Static Assets로
   배포되며, 저장소 루트의 `wrangler.jsonc` (`assets.not_found_handling: "single-page-application"`)
   가 `/projects/:id` 같은 딥링크·새로고침을 404 없이 `index.html`로 폴백시켜준다. **`public/_redirects`
   방식은 이 설정과 충돌(무한 리다이렉트 오류)하므로 쓰지 않는다** ([[decisions#adr-007]] 참고)

## 콘텐츠 반영 흐름 (예시)

1. 새 프로젝트가 생겼을 때 → Supabase 대시보드 → `projects` 테이블 → Insert row
2. 상세 설명 작성 → `project_details` 에 연결된 row insert (FK: `project_id`)
3. 사용 기술 등록 → `project_skills` 에 row 여러 개 insert
4. 포트폴리오 사이트 새로고침 → 바로 반영 (배포 불필요)

자세한 절차는 [[content-operations]] 참고.
