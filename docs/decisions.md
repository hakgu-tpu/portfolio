---
title: 설계 결정 기록 (ADR)
status: 진행 중 — 새 결정이 생길 때마다 항목 추가
---

# 설계 결정 기록 (Architecture Decision Record)

관련 문서: [[data-model]] · [[architecture]] · [[content-operations]]

> 새로운 설계 결정이 생기면 이 문서에 ADR 항목을 추가하세요. "왜 이렇게 했는가"를 남겨야
> 나중에 (Claude Code든 사람이든) 같은 논의를 반복하지 않습니다.

## ADR-001: Supabase Table Editor를 관리 화면으로 사용, 별도 어드민 미개발

**결정**: 콘텐츠 관리용 커스텀 어드민 페이지를 만들지 않고, Supabase 대시보드의 Table Editor를
그대로 관리 인터페이스로 사용한다.

**이유**: Table Editor가 이미 스프레드시트 수준의 편집 UX를 제공하므로, 별도 어드민을 만드는 개발
비용 대비 실익이 낮다. 사이트는 순수 조회 전용으로 단순화된다.

**트레이드오프**: 콘텐츠 추가 시마다 Supabase 대시보드에 로그인해야 한다. 도메인 지식이 없는
협업자에게는 편집 장벽이 있을 수 있다 (현재는 1인 운영이므로 문제 없음).

## ADR-002: 사이트는 읽기 전용, 쓰기는 RLS로 원천 차단

**결정**: `anon` 역할에는 모든 테이블에 대해 `select` 정책만 부여하고, `insert`/`update`/`delete`는
`authenticated` 역할(또는 Table Editor의 service_role)에만 허용한다. 유일한 예외는 `contacts` 테이블의
`insert` (문의 폼 제출).

**이유**: 사이트 코드에 쓰기 권한 있는 키가 노출될 경우의 보안 리스크를 원천 차단. DDD 원칙상
"데이터의 주인은 DB, 사이트는 소비자"라는 역할 분리를 강제하기 위함.

## ADR-003: 프로젝트 상세 정보(`project_details`)를 별도 테이블로 분리

**결정**: 프로젝트 상세 설명(기획 배경, 기술 상세, 어려웠던 점, 배운 점, 아키텍처)을 `projects`
테이블의 인라인 컬럼이나 JSONB 컬럼이 아니라, `project_id` FK를 가진 별도 1:1 테이블로 분리한다.

**검토했던 대안**:
| 방식 | 장점 | 단점 |
|---|---|---|
| A) `projects`에 컬럼 추가 | 단순, Supabase에서 바로 편집 편함 | 구조 변경 시 매번 migration 필요 |
| B) JSONB 컬럼 | 필드 추가가 유연함 | Table Editor에서 편집이 불편 |
| **C) 별도 테이블 (채택)** | 가장 정규화된 구조, 확장에 유리 | 조회 시 join 필요 |

**이유**: 목록/카드에 필요한 "요약 정보"와 상세 페이지에만 필요한 "긴 설명"의 라이프사이클과 편집
빈도가 다르다고 판단. Table Editor에서의 편집 편의성을 JSONB보다 우선함.

## ADR-004: `awards.project_id`를 nullable FK + `on delete set null`로 설계

**결정**: 수상 내역은 프로젝트와 관계가 있을 수도, 없을 수도 있다. FK를 nullable로 두고,
연결된 프로젝트가 삭제되더라도 수상 이력 자체는 보존되도록 `on delete set null`을 사용한다
(`cascade`가 아님).

**이유**: 수상 경력은 독립적인 이력 데이터로서, 프로젝트 레코드의 생명주기에 종속되면 안 된다는
판단. 프로젝트를 나중에 포트폴리오에서 내리더라도 수상 이력은 남아야 한다.

## ADR-005: 프론트엔드 스택을 React + Vite + TypeScript + Tailwind CSS v4로 확정

**결정**: 프론트엔드는 Vite 기반 React 19 + TypeScript로 스캐폴딩하고, 스타일링은
`@tailwindcss/vite` 플러그인을 사용하는 Tailwind CSS v4로, 라우팅은 `react-router-dom`
(`/`, `/projects/:id` 2개 라우트)으로, DB 접근은 `@supabase/supabase-js` (anon key)로 확정한다.

**이유**:
- TypeScript: `supabase/schema.sql` 을 `src/types/database.ts` 에 타입으로 미러링해두면 컬럼명
  오타나 null 처리 누락을 컴파일 타임에 잡을 수 있어, 스키마 중심 설계(DDD) 원칙과 궁합이 좋음.
- Tailwind CSS v4: 별도 PostCSS 설정 없이 Vite 플러그인 하나로 통합되어 설정 비용이 낮고,
  유틸리티 클래스로 빠르게 포트폴리오 UI를 조립하기에 적합.
- react-router-dom: 프로젝트 목록/상세 페이지 분리가 필요한 최소 요구사항을 충족하는 가장 단순한 선택.

**트레이드오프**: 없음 — 대안(JavaScript, CSS Modules/plain CSS)도 검토했으나 스키마 중심 설계와의
궁합, 개발 속도를 이유로 위 조합을 채택함.

## ADR-006: Supabase "Automatically expose new tables" 비활성화 + 명시적 GRANT 사용

**결정**: 프로젝트 생성 시 Supabase의 "Automatically expose new tables" 옵션을 끈다. 대신
`supabase/schema.sql`에 테이블별 `grant` 문을 명시적으로 추가해 Data API(PostgREST) 접근 권한을
직접 관리한다.

**이유**: 이 옵션을 켜두면 새 테이블이 생성될 때마다 `anon`/`authenticated` 역할에 기본 권한이
자동으로 부여된다. RLS 정책을 깜빡 설정하지 않은 테이블이 있어도 기본 권한 때문에 데이터가 전체
노출될 수 있어, [[decisions#adr-002]]에서 정한 "사이트는 읽기 전용" 원칙을 암묵적 설정에 맡기게
된다. 모든 접근 권한을 `schema.sql` 한 곳에 명시적으로 기록해 "이 프로젝트의 권한 원본은 어디에
있는가"를 항상 SQL 파일 하나로 추적할 수 있게 한다.

**트레이드오프**: 새 테이블을 추가할 때마다 RLS 정책뿐 아니라 `grant` 문도 함께 작성해야 한다
(누락하면 RLS를 다 맞게 짜도 PostgREST가 `permission denied` 를 반환함). `docs/data-model.md`에
새 테이블을 추가할 때 이 점을 체크리스트에 포함해야 한다.

## ADR-007: 배포는 GitHub push → Cloudflare Pages 자동 빌드

**결정**: 프론트엔드 코드를 GitHub 저장소(`hakgu-tpu` 계정, private)에 push 하고, Cloudflare Pages가
해당 저장소를 연결해 push 시마다 자동으로 빌드·배포하도록 한다. 별도 CI 파이프라인이나 수동 배포
스크립트는 두지 않는다.

**이유**: 정적 사이트(빌드 결과물이 순수 HTML/JS/CSS) 이므로 Cloudflare Pages의 Git 연동만으로
빌드·배포·CDN 서빙이 전부 해결됨. `docs/architecture.md`에서 정한 "사이트는 읽기 전용, 데이터는
Supabase가 원본"이라는 원칙과도 맞음 — 배포 파이프라인은 코드만 다루고 콘텐츠는 건드리지 않음.

**세부 설정**:
- Build command: `npm run build` / Output directory: `dist`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`는 `.env.local`이 커밋되지 않으므로 Cloudflare Pages
  프로젝트의 환경 변수 설정에 별도로 등록해야 함 (anon key라 노출돼도 안전 — [[architecture]] 참고)

**정정 (2026-09-14)**: 최초에는 SPA 라우팅 대응으로 `public/_redirects`(`/* /index.html 200`)를
추가했으나, 실제 배포에서 Cloudflare가 이 저장소를 **Workers + Static Assets** 방식으로 배포한다는
것이 확인됐다 (연결 시 자동 감지된 "Worker Name", 배포 커맨드가 `npx wrangler deploy`인 점 등).
이 방식은 `wrangler.jsonc`의 `assets.not_found_handling: "single-page-application"` 로 SPA 폴백을
선언적으로 처리하며, `_redirects`와 동시에 존재하면 "infinite loop detected" 빌드 에러가 발생한다.
→ `_redirects` 삭제, 저장소 루트에 `wrangler.jsonc` 커밋으로 대체.

이어서 두 번째 배포도 실패했는데, `assets.directory` 누락 때문이었다. 첫 배포 때는 Cloudflare가
`wrangler.jsonc`가 없는 상태를 감지해 자동으로 `dist/wrangler.json`을 만들어줬지만, 우리가 직접
`wrangler.jsonc`를 커밋한 뒤로는 그 파일을 그대로 읽어 배포하므로 빌드 산출물 경로(`dist`)를
`assets.directory`에 명시해야 했다. `npx wrangler deploy --dry-run` 로 로컬에서 설정 유효성을
먼저 검증한 뒤 커밋함.

**트레이드오프**: 없음 — 백엔드/서버리스 함수가 필요 없는 순수 정적 사이트이므로 대안(Vercel, GitHub
Pages 등)과 비교해도 큰 차이는 없음. Cloudflare Pages를 택한 것은 사용자의 선택.

## ADR-008: History 타임라인은 새 테이블 없이 `experiences.type` 확장으로 구현

**결정**: 홈 화면에 추가한 History(가로 타임라인) 섹션은 학력(대학 입학)과 병역(군 복무) 이력을 보여주는데,
이를 위한 새 테이블을 만들지 않고 기존 `experiences` 테이블의 `type` 값에 `education`·`military` 를
추가해 재사용한다. 타임라인의 막대 위치(퍼센트 좌표)는 프론트엔드에서 `experiences`/`awards`/`projects`
의 실제 `start_date`/`end_date`/`awarded_at` 값으로부터 계산하며, 좌표를 하드코딩하지 않는다.

**이유**: `experiences` 테이블은 이미 "기간이 있는 이력"(`start_date`/`end_date`/`org_name`/`role`)을
표현하도록 설계돼 있어 학력·병역도 같은 구조로 충분히 표현 가능함. 새 테이블(`history_events` 등)을
만들면 `experiences` 와 의미가 겹치는 중복 스키마가 생김. [[data-model]] 원칙("스키마가 먼저다")에 따라
디자인 목업(Claude Design 캔버스)에서 쓰인 하드코딩된 위치값은 실제 구현에 그대로 가져오지 않고,
진짜 날짜 데이터 기반 계산 로직으로 대체함.

**트레이드오프**: 프론트엔드에 날짜 → 퍼센트 좌표 변환, 그리고 한 기간이 다른 기간에 포함되는지
판별하는 로직(overlay 자동 인식)이 필요해짐 — 로직은 조금 더 복잡해지지만 데이터는 항상 DB와
일치하게 됨(디자인 목업처럼 별도로 관리되는 하드코딩 값이 어긋날 위험이 없음).

## ADR-009: History 타임라인의 트랙 분리 경계 — "같은 소속일 때만 오버레이"

**결정**: ADR-008에서 정한 "포함 관계면 오버레이" 규칙을 구체화한다. 한 experience 의 날짜 범위가
다른 experience 의 날짜 범위에 완전히 포함되더라도, **`org_name` 이 다르면 오버레이로 합치지 않고
항상 별도 트랙으로 분리해서 그린다.** 오버레이는 `org_name` 이 같을 때만(=같은 조직 안에서의 역할
변화) 적용한다.

**이유**: 처음엔 "군 복무 기간(2023.04~2024.10)이 한양대학교 재학 기간(2021.03~) 안에 날짜상
포함되니 오버레이로 겹쳐 그린다"고 구현했는데, 실제로는 군 복무 중엔 학교를 휴학한 상태라 "재학의
한 형태"가 아니라 "완전히 다른 소속에서 벌어진 별개의 일"이다. 반면 자람 학회의 "회원 → 임원진
(총무)"은 같은 조직(`org_name`='자람 학회') 안에서의 역할 변화이므로 오버레이가 맞다. `org_name`
일치 여부가 "겹쳐 그릴지 분리할지"를 가르는 정확한 경계였다.

**트레이드오프**: 없음 — 판별 조건에 `org_name` 비교 한 줄만 추가하면 되고, 데이터 모델이나 스키마
변경은 필요 없음 ([[data-model]] "트랙 분리 원칙" 참고).

## ADR-010: 프로젝트 상세 본문은 Supabase 대신 저장소 markdown 파일로 관리

**결정**: 프로젝트 상세 페이지의 장문 본문(기획배경/기술상세/어려웠던점/배운점/아키텍처)을
Supabase `project_details` 테이블이 아니라 이 저장소의 `content/projects/<slug>.md` 파일로
관리한다. `projects` 테이블에 `slug` 컬럼을 추가해 URL(`/projects/<slug>`)과 파일명이 이 값으로
매칭되도록 하고, 기존 uuid 기반 라우팅(`/projects/:id`)은 제거한다. `project_details` 테이블은
당장 drop 하지 않지만 사이트에서는 더 이상 조회하지 않는다(deprecated).

**이유**: Supabase Table Editor의 text 입력창은 여러 문단의 장문을 다듬어 쓰기에 불편하고(마크다운
문법도 지원 안 함), 변경 이력도 안 남는다. 반면 git 저장소의 `.md` 파일은 에디터에서 편하게 쓸 수
있고, 커밋 이력으로 내용 변경을 추적할 수 있으며, 리스트·코드블록 같은 마크다운 서식을 그대로 쓸 수
있다. [[architecture]]의 "정형 데이터는 Supabase, 장문 콘텐츠는 git" 원칙에 따라 역할을 분리했다.
수상(awards) 상세는 아직 UI 자체가 없어 이번에는 프로젝트만 전환하고, 필요해지면 같은
`content/awards/<slug>.md` 패턴으로 동일하게 확장할 수 있다.

**세부 구현**: `##` 헤딩으로 섹션을 구분하고, 화면에는 CSS `counter()`로 섹션 번호를 자동으로 매긴다
(React 쪽에서 섹션을 배열로 손수 관리할 필요 없음 — 마크다운에 헤딩을 추가/삭제하기만 하면 됨).
렌더링은 `react-markdown` + `remark-gfm`, 파일은 Vite의 `import.meta.glob(..., {eager:true,
query:'?raw'})` 로 빌드 타임에 번들링한다 (런타임 fetch 아님 — 정적 사이트 원칙 유지).
`ProjectDetail` 페이지는 번들 크기 때문에 `React.lazy` 로 코드 스플릿함.

**트레이드오프**: 프로젝트 상세 본문을 고치려면 (Supabase 대시보드가 아니라) git commit + push +
Cloudflare 재배포가 필요해짐 — 정형 데이터보다 반영이 느려짐. 하지만 이 콘텐츠는 자주 바뀌는 데이터가
아니라서 감수할 만한 트레이드오프로 판단함.

## ADR-011: Supabase에서 Firebase Cloud Firestore로 정형 데이터 저장소 전환

**결정**: Supabase의 저사용에 따른 리소스 이용 제한을 확인해, 프로젝트·기술·수상·이력의 정형 데이터
저장소를 Firebase Cloud Firestore로 전환한다. 프론트엔드는 Firebase Web SDK로 Firestore를 읽고,
콘텐츠 관리는 Firebase Console에서 수행한다. 정적 사이트 배포는 기존 GitHub → Cloudflare Pages 구성을
유지한다.

**이유**: 현재 Supabase 환경에서는 사용량 부족으로 필요한 리소스를 안정적으로 이용할 수 없다. Firebase
Console과 Firestore를 사용하면 별도 관리 화면 없이 현재의 읽기 전용 사이트 구조를 유지하면서 데이터
운영 기반을 교체할 수 있다.

**보안**: `firebase/firestore.rules`에서 공개 포트폴리오 컬렉션의 읽기만 허용하고 브라우저 쓰기는
차단한다. 관리자 변경은 Firebase Console의 관리자 권한으로 수행한다. 문의 폼은 아직 없으므로
`contacts` 컬렉션의 접근을 모두 차단한다.

**이관 범위**: `projects`, `project_skills`, `skills`, `awards`, `experiences`를 Firestore 최상위
컬렉션으로 옮긴다. 기존 UUID는 Firestore 문서 ID로 유지해 관계 필드(`project_id`)를 바꾸지 않는다.
`project_details`는 ADR-010에 따라 이관하지 않고, 장문 콘텐츠는 계속 `content/projects/<slug>.md`에서
관리한다. 자세한 순서는 [[firebase-migration]]을 참고한다.

**트레이드오프**: SQL의 FK·조인 제약은 Firestore에서 제공되지 않으므로, `project_id` 참조 무결성은
콘텐츠 입력 시 운영자가 관리해야 한다. 또한 Firebase 프로젝트 생성, Rules 배포, 데이터 이관 및
Cloudflare 환경변수 등록이 완료되기 전까지 실제 운영 전환은 완료되지 않는다.

## ADR-012: GitHub·블로그 링크는 Firestore `links` 컬렉션으로 관리

**결정**: 포트폴리오 주인의 외부 프로필 링크(GitHub, velog 등)를 새 `links` 컬렉션(`kind`, `label`, `url`,
`order_index`)에 저장하고, 홈 히어로와 모든 페이지 푸터에서 읽어 표시한다. 상단 네비게이션에는 넣지 않는다.

**이유**: 링크는 항목 수와 주소가 바뀔 수 있는 정형 데이터라 "정형 데이터는 Firestore" 원칙에 맞고,
LinkedIn·이메일 등을 추가할 때 재배포 없이 Firebase Console에서 바로 반영할 수 있다. 네비게이션은 모바일에서
섹션 메뉴만으로도 가로로 넘쳐 링크를 더 넣을 공간이 없다.

**장애 격리**: 링크는 부가 정보이므로 `getLinks()`는 다른 컬렉션과 따로 조회하고, 실패하면(예: Rules 배포 전
permission-denied) 빈 목록을 돌려준다. 링크 때문에 홈 전체가 "데이터를 불러오지 못했습니다"가 되지 않게 한다.

**트레이드오프 / 대안**: 히어로 소개 문구처럼 코드에 직접 쓰는 방법이 가장 단순하지만, 링크를 바꿀 때마다
재배포가 필요하다. 이름·직함·소개까지 담는 `profile` 단일 문서도 고려했으나, 지금 필요한 것은 링크뿐이라
범위를 넓히지 않았다. 소개 문구도 데이터로 옮길 필요가 생기면 그때 `profile` 도입을 다시 검토한다.

<!-- 다음 결정을 추가할 때는 아래 템플릿을 복사해서 사용하세요.

## ADR-00N: <결정 제목>

**결정**: ...

**이유**: ...

**트레이드오프 / 대안**: ...
-->
