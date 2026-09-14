-- =========================================================
-- Seed: 3개 대상 프로젝트 (Fithub / Dartoo / 내일의 나)
-- =========================================================
-- 이미 schema.sql 이 적용된 기존 Supabase 프로젝트에 대해
-- SQL Editor 에서 이 파일만 추가로 실행하면 됩니다.
-- (schema.sql 자체도 이 데이터를 포함하도록 함께 갱신했습니다 —
--  향후 프로젝트를 새로 만들 때는 schema.sql 한 번 실행으로 충분합니다.)
-- =========================================================

-- ① projects
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

-- ② project_details
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

-- ③ project_skills
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

-- ④ awards ↔ projects 연결
-- 시화나래 크래커톤(2025), 캠퍼스 특허 유니버시아드(2022) 는 세 프로젝트와 무관 → project_id 는 null 유지
update awards set project_id = '379d437a-f76b-42a3-a4c9-5fd840125585'
  where title = '한양대 SW/ICT/AI 종합 학술대회' and prize = '최우수상';

update awards set project_id = '46917ef1-e7c3-4fe0-9c1c-6502bca0eca8'
  where title = '한양대 SW/ICT/AI 종합 학술대회' and prize = '우수상';
