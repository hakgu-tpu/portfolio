-- =========================================================
-- Portfolio Site — Database Schema (Source of Truth)
-- =========================================================
-- 이 파일은 포트폴리오 사이트의 데이터 모델 "원본"입니다.
-- 스키마를 변경할 때는 반드시 이 파일을 먼저 수정하고,
-- Supabase 대시보드(SQL Editor)에 반영한 뒤,
-- docs/data-model.md 의 설명도 함께 갱신하세요.
-- =========================================================

-- ① 프로젝트 — 목록/카드에 노출되는 기본 정보
create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,                         -- 한줄 설명 (목록에서 보이는)
  role        text,                         -- 본인 역할 요약
  team_size   int,
  start_date  date,
  end_date    date,                         -- null이면 진행 중
  service_url text,
  github_url  text,
  is_featured boolean default true,         -- 메인 노출 여부
  order_index int default 0,
  created_at  timestamptz default now()
);

-- ② 프로젝트 세부 내용 (projects 와 1:1)
create table project_details (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade unique,
  background   text,   -- 기획 배경 / 프로젝트 동기
  tech_detail  text,   -- 기술적 구현 상세
  challenges   text,   -- 어려웠던 점 & 해결 방법
  learned      text,   -- 배운 점
  architecture text,   -- 아키텍처 설명 or 이미지 URL
  created_at   timestamptz default now()
);

-- ③ 프로젝트 ↔ 기술 스택 (1:N)
create table project_skills (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  skill_name text not null,
  is_my_part boolean default true   -- 본인 담당 기술 여부
);

-- ④ 수상 내역 — 프로젝트와 0..1 관계 (수상이 특정 프로젝트와 무관할 수도 있음)
create table awards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  prize       text not null,
  organizer   text,
  awarded_at  date not null,
  project_id  uuid references projects(id) on delete set null,  -- nullable FK
  order_index int default 0,
  created_at  timestamptz default now()
);

-- ⑤ 기술 스택 (전체 — 소개 섹션용)
create table skills (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,  -- 'Language' | 'Framework' | 'DevOps' | 'Tools'
  name        text not null,
  level       text,           -- 'main' | 'sub'
  order_index int default 0
);

-- ⑥ 활동/학회
create table experiences (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,  -- 'club' | 'intern' | 'activity'
  org_name    text not null,
  role        text,
  description text,
  start_date  date,
  end_date    date,           -- null이면 진행 중
  order_index int default 0
);

-- ⑦ 컨택 폼 수신함
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table projects        enable row level security;
alter table project_details enable row level security;
alter table project_skills  enable row level security;
alter table awards          enable row level security;
alter table skills          enable row level security;
alter table experiences     enable row level security;
alter table contacts        enable row level security;

-- 공개 읽기 (사이트에서 조회) — anon key 로 접근
create policy "public read" on projects        for select using (true);
create policy "public read" on project_details for select using (true);
create policy "public read" on project_skills  for select using (true);
create policy "public read" on awards          for select using (true);
create policy "public read" on skills          for select using (true);
create policy "public read" on experiences     for select using (true);

-- 쓰기는 본인(authenticated)만 — 실제 편집은 Supabase 대시보드(Table Editor)에서
-- service_role 로 이루어지므로 이 정책은 향후 API 경유 쓰기에 대한 방어선 역할
create policy "owner write" on projects        for all using (auth.role() = 'authenticated');
create policy "owner write" on project_details for all using (auth.role() = 'authenticated');
create policy "owner write" on project_skills  for all using (auth.role() = 'authenticated');
create policy "owner write" on awards          for all using (auth.role() = 'authenticated');
create policy "owner write" on skills          for all using (auth.role() = 'authenticated');
create policy "owner write" on experiences     for all using (auth.role() = 'authenticated');

-- contacts: 누구나 insert(문의 남기기), 본인만 읽기
create policy "public insert" on contacts for insert with check (true);
create policy "owner read"    on contacts for select using (auth.role() = 'authenticated');

-- =========================================================
-- Grants (PostgREST 기본 권한)
-- =========================================================
-- Supabase 프로젝트 생성 시 "Automatically expose new tables" 를 끈 상태이므로,
-- RLS 정책과 별개로 테이블 단위 GRANT 를 명시적으로 부여해야 Data API(PostgREST)가
-- 이 테이블들에 접근할 수 있다. (RLS는 "허용된 row"를, GRANT는 "허용된 동작"을 결정)
grant usage on schema public to anon, authenticated;

grant select on
  projects, project_details, project_skills, awards, skills, experiences
  to anon, authenticated;

grant insert, update, delete on
  projects, project_details, project_skills, awards, skills, experiences
  to authenticated;

grant insert on contacts to anon, authenticated;
grant select on contacts to authenticated;

-- =========================================================
-- Seed data — 프로젝트 / 기술 스택 / 수상 / 활동
-- =========================================================

-- 대상 프로젝트 3건: Fithub / Dartoo / 내일의 나
insert into projects (id, name, description, role, team_size, start_date, end_date, service_url, github_url, is_featured, order_index) values
  ('c0d49ff7-c557-4e96-8d5a-d4829dd67647', 'Fithub',
   '식단·운동 루틴을 생성하고 관리·공유하는 서비스',
   'PM 및 인프라 환경 구축 (K8s, Envoy Gateway, GitHub Actions CI)',
   4, '2025-12-01', '2026-04-01',
   'https://fithub.life', 'https://github.com/JAC-FitHub', true, 1),

  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'Dartoo',
   '실시간 공시정보 요약 서비스',
   '백엔드 개발(Spring Boot) 및 인프라·운영 환경 구축 (K8s, Envoy Gateway, GitHub Actions CI), 통합 테스트 환경 구축',
   6, '2025-07-01', '2026-09-01',
   'https://dartoo.co.kr', 'https://github.com/team-dartoo', true, 2),

  ('46917ef1-e7c3-4fe0-9c1c-6502bca0eca8', '내일의 나',
   '고등학생을 대상으로 AI 기반 진로 상담과 진로 로드맵을 제공하는 서비스',
   '백엔드 개발(Spring Boot) 및 Kubernetes 기반 인프라 환경 구축',
   4, '2025-07-01', '2026-04-01',
   'https://tomorrow.me.kr/', 'https://github.com/team-1to3', true, 3);

insert into project_details (project_id, background, tech_detail, challenges, learned, architecture) values
  ('c0d49ff7-c557-4e96-8d5a-d4829dd67647',
   '운동과 식단을 함께 관리할 수 있는 서비스가 없다는 점에서 출발했다.',
   'Kubernetes 기반 배포 환경을 구축했다.',
   '단기 개발 프로젝트 특성상 개발이 완료된 코드가 빠르게 배포 환경에 반영되고 곧바로 테스트까지 가능해야 했다. 이를 위해 GitHub Actions 기반 CI/CD 파이프라인을 구축했다.',
   'PM으로서 팀 간 개발 속도와 의존 관계를 조율하는 방법, 그리고 팀원들의 요구사항을 반영하기 위한 협업 도구를 도입하고 운영하는 방법을 배웠다.',
   null),

  ('379d437a-f76b-42a3-a4c9-5fd840125585',
   'DART 공시정보 OpenAPI를 활용해 공시 내용을 빠르게 요약해 전달하는 서비스를 개발하고자 했다.',
   'DART 공시정보 OpenAPI로 수집한 XML을 AI가 해석할 수 있는 형태로 전처리한 뒤, 이를 바탕으로 요약과 분석이 가능하도록 구현했다.',
   '팀원 수가 많았음에도 버전 관리가 이뤄지지 않아 GitHub 저장소에 로컬에서만 동작하는 코드가 쌓여 있었다. 이에 Git 브랜치 규칙을 정하고 단위 테스트 → 통합 테스트 → 시스템 테스트로 이어지는 검증 단계를 도입해, 배포된 서비스에서 최소한 코드로 인한 비정상 종료는 발생하지 않도록 했다. 또한 단순한 배포를 넘어 서비스 운영을 위한 모니터링·로깅 환경 구축이 필요했다.',
   '테스트 환경 구축과 협업 규칙의 필요성을 배울 수 있었다. 더불어 여러 노드로 구성된 클러스터 환경에서 프로세스를 분리하고 네트워크를 관리하는 방법을 배웠다.',
   null),

  ('46917ef1-e7c3-4fe0-9c1c-6502bca0eca8',
   '교육과정이 개편되면서 학생 스스로 진로를 결정하고 실행에 옮기는 일이 중요해졌다. 이러한 흐름에 맞춰 학생에게 적합한 진로를 제안하고, AI를 활용해 그에 따른 로드맵까지 제공하는 서비스를 구축하고자 했다.',
   '회원 관리와 DB 데이터 CRUD는 Java 기반 Spring Boot로 구현했으며, 사용자 대화 및 로드맵 생성에 필요한 AI API 통신과 프롬프트 컨텍스트 구성은 LangGraph로 구현했다.',
   '첫 팀 프로젝트로 여러 개발자가 하나의 Git 저장소를 동시에 수정하다 보니 코드 일관성이 무너지고 개발 의존성이 얽히는 문제가 발생했다. 이를 해결하기 위해 요구사항을 기준으로 기능(feature)을 분리하고, 유스케이스를 사전에 정의해 기능 간 의존 관계를 파악한 뒤 도메인과 역할을 나누어 개발을 진행했다.',
   '소프트웨어 개발을 위한 설계서를 작성하고, 이를 기반으로 팀원 간 역할을 어떻게 나눠야 하는지 배울 수 있었다.',
   E'첫 팀 프로젝트인 만큼 효율성보다는 팀원들의 개발 경험을 기준으로 한 구현 가능성에 초점을 두고 아키텍처 컴포넌트를 구성했다.\n- FE: React + Next.js\n- Core BE Service: Spring Boot\n- AI BE Service: FastAPI + LangGraph');

insert into project_skills (project_id, skill_name, is_my_part) values
  ('c0d49ff7-c557-4e96-8d5a-d4829dd67647', 'Kubernetes',      true),
  ('c0d49ff7-c557-4e96-8d5a-d4829dd67647', 'Envoy Gateway',   true),
  ('c0d49ff7-c557-4e96-8d5a-d4829dd67647', 'GitHub Actions',  true),

  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'Java',            true),
  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'Spring Boot',     true),
  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'Kubernetes',      true),
  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'Envoy Gateway',   true),
  ('379d437a-f76b-42a3-a4c9-5fd840125585', 'GitHub Actions',  true),

  ('46917ef1-e7c3-4fe0-9c1c-6502bca0eca8', 'Java',            true),
  ('46917ef1-e7c3-4fe0-9c1c-6502bca0eca8', 'Spring Boot',     true),
  ('46917ef1-e7c3-4fe0-9c1c-6502bca0eca8', 'Kubernetes',      true);

insert into skills (category, name, level, order_index) values
  ('Language',  'Java',           'main', 1),
  ('Language',  'Python',         'sub',  2),
  ('Language',  'C',              'sub',  3),
  ('Framework', 'Spring Boot',    'main', 1),
  ('Framework', 'FastAPI',        'sub',  2),
  ('Database',  'MySQL',          'sub',  1),
  ('Database',  'PostgreSQL',     'sub',  2),
  ('DevOps',    'Kubernetes',     'main', 1),
  ('DevOps',    'Docker',         'main', 2),
  ('DevOps',    'GitHub Actions', 'sub',  3),
  ('DevOps',    'Envoy Gateway',  'sub',  4),
  ('DevOps',    'Helm',           'sub',  5),
  ('DevOps',    'Grafana',        'sub',  6),
  ('DevOps',    'Prometheus',     'sub',  7),
  ('DevOps',    'Linux',          'sub',  8),
  ('Tools',     'IntelliJ',       'sub',  1),
  ('Tools',     'VSCode',         'sub',  2),
  ('Tools',     'Postman',        'sub',  3),
  ('Tools',     'APIdog',         'sub',  4);

-- 시화나래 크래커톤, 캠퍼스 특허 유니버시아드는 세 프로젝트와 무관 → project_id null
insert into awards (title, prize, organizer, awarded_at, project_id) values
  ('캠퍼스 특허 유니버시아드',              '산업통상자원부 장관상', '특허청·한국발명진흥회', '2022-01-01', null),
  ('시화나래 크래커톤',                    '대상',               '시화나래 조력발전소',  '2025-01-01', null),
  ('한양대 SW/ICT/AI 종합 학술대회',       '최우수상',            '한양대학교 ERICA',    '2025-01-01', '379d437a-f76b-42a3-a4c9-5fd840125585'), -- Dartoo
  ('한양대 SW/ICT/AI 종합 학술대회',       '우수상',              '한양대학교 ERICA',    '2025-01-01', '46917ef1-e7c3-4fe0-9c1c-6502bca0eca8'); -- 내일의 나

insert into experiences (type, org_name, role, description, start_date, end_date) values
  ('club', '자람 학회', '회원',           '선배 네트워킹 포럼 기획, 학술대회 진행', '2022-03-01', '2026-02-28'),
  ('club', '자람 학회', '임원진 (총무)',   '학회 운영 총괄 및 예산 관리',           '2025-05-01', '2026-02-28');
