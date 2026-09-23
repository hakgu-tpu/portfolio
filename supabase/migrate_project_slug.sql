-- =========================================================
-- Migration: projects.slug 컬럼 추가 (project_details → markdown 전환의 일부)
-- =========================================================
-- content/projects/<slug>.md 와 매칭되고, 사이트 라우팅도
-- /projects/<uuid> 대신 /projects/<slug> 로 바뀐다.
-- =========================================================

alter table projects add column slug text;

update projects set slug = 'fithub'   where id = 'c0d49ff7-c557-4e96-8d5a-d4829dd67647';
update projects set slug = 'dartoo'   where id = '379d437a-f76b-42a3-a4c9-5fd840125585';
update projects set slug = 'tomorrow' where id = '46917ef1-e7c3-4fe0-9c1c-6502bca0eca8';

alter table projects alter column slug set not null;
alter table projects add constraint projects_slug_key unique (slug);
