-- =========================================================
-- Fix: 자람 학회 description을 실제 담당 시점(총무)으로 이동
-- =========================================================
-- "선배 네트워킹 포럼 기획, 학술대회 진행"은 회원 시절이 아니라
-- 임원진(총무) 시절에 한 일이었음 — description을 총무 row로 옮기고
-- 회원 row는 비워둠.
-- =========================================================

update experiences
set description = null
where type = 'club' and org_name = '자람 학회' and role = '회원';

update experiences
set description = '학회 운영 총괄 및 예산 관리, 선배 네트워킹 포럼 기획, 학술대회 진행'
where type = 'club' and org_name = '자람 학회' and role = '임원진 (총무)';
