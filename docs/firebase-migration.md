---
title: Firebase 전환 절차
status: 실행 대기 — Firebase 프로젝트 권한 필요
---

# Firebase / Firestore 전환 절차

Supabase 저사용에 따른 리소스 제한으로, 2026-10에 사이트의 정형 데이터 저장소를 Cloud Firestore로
전환하기로 결정했다 ([[decisions#adr-011]]). 프론트엔드 배포는 기존 Cloudflare를 유지한다.

## 이 저장소에서 준비된 항목

- `src/lib/firebase.ts`: Firebase Web SDK 초기화
- `src/lib/data.ts`: Firestore 조회 로직
- `firebase/firestore.rules`: 공개 포트폴리오 읽기 전용 규칙
- `firebase/firestore-data.json`: 기존 시드 데이터를 옮긴 컬렉션별 JSON
- `firebase.json`: Firestore 규칙 배포 설정

## 최초 전환 순서

1. Firebase Console에서 프로젝트를 만들고 **Cloud Firestore (Native mode)** 를 활성화한다.
2. Web App을 등록한 뒤 SDK 설정값을 복사한다.
3. `.env.local.example`을 `.env.local`로 복사하고 `VITE_FIREBASE_*` 값을 입력한다.
   Cloudflare Pages의 Production 환경 변수에도 같은 값을 등록한다. Firebase Web 설정값은 공개 클라이언트
   설정값이므로 저장소 비밀값으로 취급하지는 않지만, `.env.local` 자체는 커밋하지 않는다.
4. Firebase CLI에서 올바른 프로젝트를 선택한 뒤 `firebase deploy --only firestore:rules`로 규칙을 배포한다.
5. 새 서비스 계정 키 파일의 **절대 경로**를 환경변수로 지정해 데이터를 일괄 입력한다. 키 파일은 저장소
   밖에 보관하며, 채팅이나 환경변수 파일에 그 내용을 복사하지 않는다.
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json" npm run firebase:import:dry-run
   GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json" npm run firebase:import
   ```
   스크립트는 각 객체의 `id`를 **문서 ID**로 사용하고 나머지 필드를 저장한다. 같은 문서 ID가 이미 있으면
   해당 문서는 입력 JSON으로 교체하며, JSON에 없는 기존 문서는 삭제하지 않는다. 날짜는 `YYYY-MM-DD`
   문자열로 저장한다.
6. `npm run dev`로 홈 및 `/projects/fithub`, `/projects/dartoo`, `/projects/tomorrow`를 확인한다.
7. Cloudflare 배포 환경 변수 등록 후 배포 사이트에서 동일하게 확인한다.

## 운영 원칙

- `projects`, `project_skills`, `skills`, `awards`, `experiences`, `certificates`, `links`는 Firestore Console에서 관리한다.
- 상세 프로젝트 본문은 계속 `content/projects/<slug>.md`가 원본이다.
- 브라우저에서는 공개 컬렉션을 읽기만 한다. 콘텐츠 수정은 Firestore Console의 관리자 권한으로 한다.
- `contacts` UI는 아직 없으며, 추가 전까지 Firestore Rules에서 모든 접근을 막는다.
- 이미지 기능을 시작할 때 Firebase Storage 도입 여부와 Storage Rules를 별도 결정한다.
