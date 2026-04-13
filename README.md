# BoardHub — 마이티 카드게임

> 5인 트릭테이킹 보드게임 온라인 플랫폼. AI 싱글플레이 + 실시간 멀티플레이 지원.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | NestJS 10, Socket.io, TypeScript |
| 게임 엔진 | 순수 TypeScript (공유 패키지) |
| DB | Supabase (PostgreSQL) |
| 배포 | Vercel (FE) + Railway (BE) |
| 모노레포 | Turborepo + pnpm workspaces |

## 주요 기능

- **싱글플레이** — 초보·중수·고수 AI 봇 4명과 대전
- **멀티플레이** — 5인 실시간 대전 (Socket.io)
- **마이티 게임 엔진** — 마이티/조커/트럼프/프렌드 카드 완전 구현
- **고수 AI** — IS-MCTS (Information Set Monte Carlo Tree Search) 알고리즘
- **카드 애니메이션** — Framer Motion 기반 부채꼴 패, 트릭 이동 효과

## 로컬 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (FE + BE 동시)
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 환경변수 설정

```bash
# apps/web/.env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:4000

# apps/server/.env
PORT=4000
CORS_ORIGIN=https://your-app.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`.env.example` 파일을 복사해서 사용:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
```

## 배포

### Frontend — Vercel

1. [vercel.com](https://vercel.com) 에서 이 레포를 import
2. Root Directory: `apps/web`
3. Environment Variables에 `NEXT_PUBLIC_SERVER_URL` 추가 (Railway 서버 URL)

### Backend — Railway

1. [railway.app](https://railway.app) 에서 이 레포를 연결
2. `apps/server/railway.toml` 자동 감지
3. Variables에 `.env.example` 항목들 추가

## 디렉토리 구조

```
board-game-hub/
├── apps/
│   ├── web/          ← Next.js 14 프론트엔드
│   └── server/       ← NestJS 백엔드
└── packages/
    └── game-engine/  ← 순수 TS 마이티 게임 엔진 (FE/BE 공유)
```

## 게임 규칙 요약

- 5명 플레이, 각 10장 배분 + 키티 3장
- 입찰로 주공 결정 → 트럼프 선언 → 프렌드 카드 선언
- 10번의 트릭으로 점수 카드(A·10·K) 획득
- 주공팀 목표: 선언 공약 이상 득점
- 마이티(♠A) > 조커 > 트럼프 > 선 수트 순으로 카드 강도

---

Made by [이형민](https://github.com/lhm) · 경성대학교 컴퓨터공학과
