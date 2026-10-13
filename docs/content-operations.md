---
title: 콘텐츠 운영 가이드
status: Firestore 전환 중
---

# 콘텐츠 운영 가이드 (Firebase Console에서 직접 수정)

관련 문서: [[data-model]] · [[architecture]] · [[decisions]]

정형 데이터(프로젝트 요약, 기술 스택, 수상, 경력)는 코드 배포 없이 **Firebase Console →
Firestore Database**에서 수정하는 것만으로 콘텐츠가 갱신됩니다. 단,
프로젝트 상세 본문은 2026-09 부터 이 저장소의 markdown 파일로 관리하며, 이건 git push 후
배포가 끝나야 반영됩니다 ([[decisions#adr-010]]). 아래는 자주 발생하는 작업의 절차입니다.

## 새 프로젝트 추가하기

1. `projects` 컬렉션 → **Add document** (문서 ID는 안정적인 UUID 또는 slug 기반 값 사용)
   - `slug`(영문 소문자, URL과 파일명에 쓰임 — 예: `dartoo`), `name`,
     `description`(목록용 한줄 설명), `role`, `team_size`, `start_date`/`end_date`,
     `service_url`, `github_url`, `is_featured`, `order_index` 입력
   - 생성된 `id`(uuid)를 복사해둔다 (`project_skills`/`awards` 연결에 필요)
2. 저장소에 `content/projects/<slug>.md` 파일 추가 — `##` 로 섹션을 나눠서 작성
   (예: `## 기획 배경`, `## 기술적 구현 상세`, …). 섹션 번호는 화면에서 자동으로 매겨지므로
   신경 쓸 필요 없음. 원하는 만큼 섹션을 추가/삭제해도 된다.
3. `project_skills` 컬렉션 → 사용 기술 개수만큼 문서 추가 (각 문서마다 `project_id`, `skill_name`,
   `is_my_part`)
4. git commit + push → Cloudflare 재배포 후 반영 확인 (Supabase 데이터만 바뀐 경우는 새로고침으로
   바로 확인 가능하지만, markdown 본문은 배포가 끝나야 보임)

> `project_details`는 더 이상 사이트가 읽지 않는 deprecated 데이터 모델입니다 — 새 프로젝트를
> 추가할 때 여기에 데이터를 넣지 마세요.

## 수상 내역 추가하기

1. `awards` 컬렉션 → 문서 추가
2. 특정 프로젝트와 관련된 수상이면 `project_id` 에 해당 프로젝트의 uuid 입력, 무관하면 비워둠(null)
   ([[decisions#adr-004]] 참고)

## 기술 스택 갱신하기

- 소개 섹션에 노출되는 전체 스킬: `skills` 컬렉션 직접 수정 (`category`/`level`/`order_index` 로 정렬·강조 제어)
- 특정 프로젝트에서 사용한 기술: 해당 프로젝트의 `project_skills` 문서 추가/삭제

## 자격증 추가하기

1. `certificates` 컬렉션에 문서를 추가한다.
2. 필수 필드: `category` (`major` 또는 `language`), `name`, `issuer`, `status`, `acquired_at`, `order_index`
3. 자격번호가 없으면 `certificate_number`를 `null`로, 평생 유효면 `valid_until`을 `null`로 둔다.
4. 날짜는 `YYYY-MM-DD` 문자열로 입력한다.

## 활동/학회/학력/병역 이력 갱신하기 (History 타임라인)

- `experiences` 컬렉션에서 직접 관리. `type` 값: `education`·`military`·`club`·`intern`·`activity`.
  진행 중인 활동은 `end_date` 를 비워둔다.
- 홈의 History 타임라인은 이 테이블(과 `awards`/`projects`)의 날짜값으로 좌표를 자동 계산해서
  그린다 — 좌표를 직접 관리할 필요 없음.
- **같은 `org_name`** 안에서 한 row의 기간이 다른 row의 기간에 완전히 포함되면 같은 트랙에
  겹쳐 그려진다(예: 자람 학회 "회원" 기간 안의 "임원진(총무)" 기간). `org_name` 이 다르면 날짜가
  겹쳐도 항상 별도 트랙으로 분리된다 ([[decisions#adr-009]]).

## 문의(contact) 확인하기

- 문의 폼은 아직 구현되지 않았고 Firestore Rules도 `contacts` 접근을 차단한다. 폼을 추가할 때 Rules와
  운영 절차를 함께 확정한다.
