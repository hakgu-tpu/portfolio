---
title: 아키텍처
status: 전환 중 (Firestore 설정·데이터 이관 대기)
---

# 아키텍처

관련 문서: [[data-model]] · [[decisions]] · [[content-operations]] · [[firebase-migration]]

## 전체 구조 — 읽기/쓰기 분리

```
Firebase Console (관리자)
  └─ Cloud Firestore: 프로젝트·스킬·수상·이력 수정
       └─ Firebase Web SDK: 공개 사이트는 읽기만 수행
            └─ React/Vite 정적 사이트 → Cloudflare Pages 배포

Git 저장소
  └─ content/projects/<slug>.md: 프로젝트 장문 본문 원본
```

- **Firestore**: 프로젝트 요약, 프로젝트별 기술, 전체 기술, 자격증, 수상, 이력 등 정형 데이터
- **Git Markdown**: 프로젝트 상세 장문 콘텐츠
- **Cloudflare Pages**: Vite 산출물(`dist`) 정적 배포 및 SPA fallback

사이트 브라우저는 Firestore Security Rules로 공개 컬렉션을 읽기만 할 수 있다. 콘텐츠 변경은 Firebase
Console의 관리자 권한으로 수행하며, 관리자 서비스 계정 키를 클라이언트에 포함하지 않는다.

## 기술 스택

| 영역 | 선택 | 상태 |
|---|---|---|
| 포트폴리오 형식 | 웹사이트 (HTML) | ✅ 확정 |
| 정형 데이터 | Firebase Cloud Firestore | 🔄 전환 중 |
| 접근 제어 | Firestore Security Rules | 🔄 규칙 작성 완료, 배포 대기 |
| 프론트엔드 | React 19 + Vite + TypeScript | ✅ 확정 |
| 스타일링 | Tailwind CSS v4 | ✅ 확정 |
| 라우팅 | react-router-dom (`/`, `/projects/:slug`) | ✅ 확정 |
| DB 클라이언트 | Firebase Web SDK (`firebase/firestore`) | ✅ 전환 코드 완료 |
| 배포 | GitHub → Cloudflare Pages | ✅ 확정 |
| 이미지 저장소 | Firebase Storage 도입 여부 | ⏳ 미착수 |

> Supabase는 저사용에 따른 리소스 제한으로 사용을 중단하기로 결정했다. 기존 `supabase/` SQL은
> 과거 스키마와 데이터의 참고용 아카이브이며, 현행 런타임은 참조하지 않는다.

## 프론트엔드 구조

```
src/
  main.tsx
  App.tsx                         # /, /projects/:slug 라우트
  lib/firebase.ts                 # Firebase 앱 및 Firestore 초기화
  lib/data.ts                     # Firestore 조회 로직
  lib/content.ts                  # content/projects/*.md 빌드 타임 로더
  lib/timeline.ts                 # 날짜 기반 History 좌표 계산
  types/database.ts               # Firestore 문서 타입
  pages/Home.tsx
  pages/ProjectDetail.tsx
  components/

firebase/
  firestore.rules                 # Firestore Security Rules
  firestore-data.json             # 최초 이관용 컬렉션 데이터
content/projects/<slug>.md        # 프로젝트 상세 본문
```

## 환경 변수

`.env.local.example`을 복사해 `.env.local`을 만들고 Firebase Console의 Web App 설정값을 입력한다.
Cloudflare Pages 배포 환경에도 동일한 `VITE_FIREBASE_*` 변수를 등록해야 한다.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firestore 최초 설정 및 이관

Firebase Console에서 Firestore를 **Native mode**로 활성화하고 Web App을 등록한다. 이후 `firebase.json`과
`firebase/firestore.rules`를 기준으로 Rules를 배포하고, `firebase/firestore-data.json`의 데이터를
동명 컬렉션으로 입력한다. 상세한 실행 순서는 [[firebase-migration]]을 따른다.

## 배포

Cloudflare Pages는 계속 Vite 빌드(`npm run build`) 결과물 `dist`를 배포한다. `wrangler.jsonc`의
`assets.not_found_handling: "single-page-application"`이 `/projects/:slug` 딥링크를 처리한다.
