---
title: 콘텐츠 운영 가이드
status: 초안
---

# 콘텐츠 운영 가이드 (Supabase 대시보드에서 직접 수정)

관련 문서: [[data-model]] · [[architecture]] · [[decisions]]

이 사이트는 코드 배포 없이 **Supabase 대시보드 → Table Editor** 에서 데이터를 수정하는 것만으로
콘텐츠가 갱신됩니다 (이유: [[decisions#adr-001]]). 아래는 자주 발생하는 작업의 절차입니다.

## 새 프로젝트 추가하기

1. `projects` 테이블 → **Insert row**
   - `name`, `description`(목록용 한줄 설명), `role`, `team_size`, `start_date`/`end_date`,
     `service_url`, `github_url`, `is_featured`, `order_index` 입력
   - 생성된 `id`(uuid)를 복사해둔다
2. `project_details` 테이블 → **Insert row**
   - `project_id` 에 위에서 복사한 uuid 입력
   - `background`, `tech_detail`, `challenges`, `learned`, `architecture` 작성
3. `project_skills` 테이블 → 사용 기술 개수만큼 **Insert row** (각 row마다 `project_id`, `skill_name`,
   `is_my_part`)
4. 사이트 새로고침 → 반영 확인

## 수상 내역 추가하기

1. `awards` 테이블 → **Insert row**
2. 특정 프로젝트와 관련된 수상이면 `project_id` 에 해당 프로젝트의 uuid 입력, 무관하면 비워둠(null)
   ([[decisions#adr-004]] 참고)

## 기술 스택 갱신하기

- 소개 섹션에 노출되는 전체 스킬: `skills` 테이블 직접 수정 (`category`/`level`/`order_index` 로 정렬·강조 제어)
- 특정 프로젝트에서 사용한 기술: 해당 프로젝트의 `project_skills` row 추가/삭제

## 활동/학회 이력 갱신하기

- `experiences` 테이블에서 직접 관리. 진행 중인 활동은 `end_date` 를 비워둔다.

## 문의(contact) 확인하기

- `contacts` 테이블에서 조회 (본인만 읽기 가능 — RLS)
- 확인한 문의는 `is_read` 를 `true` 로 변경

## 아직 정리되지 않은 시드 데이터

`supabase/schema.sql` 하단의 seed 섹션에는 `skills`/`awards`/`experiences` 시드만 있고, 실제
포트폴리오 대상 프로젝트(Fithub, Dartoo, 내일의 나)의 `projects`/`project_details`/`project_skills`
데이터는 아직 없습니다. 위 "새 프로젝트 추가하기" 절차를 따라 3개 프로젝트를 먼저 채워 넣고,
기존 `awards` 시드 row 들의 `project_id` 를 실제 값으로 업데이트하세요.
