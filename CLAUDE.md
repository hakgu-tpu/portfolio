# Portfolio Site

개인 포트폴리오 웹사이트 프로젝트. **Data-Driven Design(DDD)** 방식으로 설계한다 —
화면을 먼저 만들지 않고, DB 스키마를 먼저 확정한 뒤 사이트는 그 데이터를 조회해서
보여주는 소비자 역할만 한다.

## 이 문서 세트의 역할

이 저장소는 아직 실제 애플리케이션 코드보다 **설계서가 먼저 존재하는 상태**다. Claude Code가
이 프로젝트에서 작업할 때는 아래 문서들을 먼저 참고하고, 새로운 결정을 내릴 때마다 해당 문서를
함께 갱신해야 한다.

| 문서 | 내용 |
|---|---|
| [`docs/data-model.md`](docs/data-model.md) | 테이블 구조, 관계(ERD), 각 컬럼의 의미 |
| [`docs/architecture.md`](docs/architecture.md) | 읽기/쓰기 분리 구조, 기술 스택 현황(확정 vs 제안) |
| [`docs/decisions.md`](docs/decisions.md) | 왜 이렇게 설계했는지에 대한 결정 기록 (ADR) |
| [`docs/content-operations.md`](docs/content-operations.md) | Supabase 대시보드에서 콘텐츠를 추가/수정하는 절차 |
| [`supabase/schema.sql`](supabase/schema.sql) | **스키마의 원본(source of truth)** — 실행 가능한 SQL |

## 핵심 원칙

1. **스키마가 먼저다.** 새 콘텐츠 요구사항이 생기면 UI보다 먼저 "테이블/컬럼을 어떻게 바꿔야
   하는가"를 결정한다.
2. **`supabase/schema.sql`이 유일한 원본이다.** 스키마를 바꾸면 이 파일을 먼저 수정하고,
   `docs/data-model.md`의 설명을 함께 갱신한다. 문서와 SQL이 어긋나면 SQL이 맞다.
3. **사이트는 읽기 전용이다.** RLS로 강제되는 원칙이며, 새 기능이 "사이트에서 데이터를 써야 한다"고
   요구하면 이건 예외적인 상황이니 먼저 [[architecture]]와 [[decisions]]를 재확인하고 사용자와
   상의한다 (현재 유일한 예외: `contacts` 테이블의 문의 폼 insert).
4. **결정은 기록한다.** 테이블 구조, FK 관계, 권한 정책 등에서 "왜 이렇게 했는가"를 결정할 때마다
   `docs/decisions.md`에 ADR 항목을 추가한다. 같은 논의를 반복하지 않기 위함이다.
5. **확정과 제안을 구분한다.** `docs/architecture.md`의 기술 스택 표에는 "확정"과 "제안만 됨" 상태가
   표시돼 있다. 제안 단계 항목(예: 프론트엔드 프레임워크)을 이미 정해진 것처럼 다루지 말고, 실제
   작업 전에 사용자에게 확인한다.

## 현재 상태 (2026-09-14 기준)

- ✅ 포트폴리오 형식: 웹사이트(HTML) 확정
- ✅ 대상 프로젝트 3건 확정: Fithub, Dartoo, 내일의 나
- ✅ DB 스키마 v1 확정 (7개 테이블 + RLS) — `supabase/schema.sql` 참고
- ✅ 프론트엔드 스택 확정 및 스캐폴딩 완료: React 19 + Vite + TypeScript + Tailwind CSS v4 +
  react-router-dom + `@supabase/supabase-js` — `docs/architecture.md` 참고
- ✅ 실제 Supabase 프로젝트 생성 완료, `schema.sql` 실행 및 GRANT/RLS 반영 확인, `.env.local` 연동 확인
- ✅ Fithub / Dartoo / 내일의 나 3개 프로젝트 실데이터 입력 완료 (`supabase/seed_projects.sql`), 수상 내역
  중 2건(한양대 최우수상 → Dartoo, 우수상 → 내일의 나) 연결 완료. 목록/상세 페이지 브라우저 확인 완료
- ⏳ 미확정: 배포 방식, 이미지 스토리지(Supabase Storage 예정 — 프로젝트 썸네일/아키텍처 다이어그램에 필요)
