# Portfolio Site

개인 포트폴리오 웹사이트. 설계 원칙과 데이터 모델은 [`CLAUDE.md`](CLAUDE.md) 와 [`docs/`](docs) 를 참고하세요.

## 개발 환경 준비

1. `.env.local.example` 을 복사해 `.env.local` 생성 후 Supabase 프로젝트의 URL/anon key 입력
2. `npm install`
3. `npm run dev`

## 스택

React 19 + Vite + TypeScript + Tailwind CSS v4 + react-router-dom + Supabase (`@supabase/supabase-js`).
자세한 내용은 [`docs/architecture.md`](docs/architecture.md) 참고.
