FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# 의존성 설치
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/game-engine/package.json ./packages/game-engine/

RUN pnpm install --frozen-lockfile

# 소스 복사 및 빌드
COPY packages/game-engine ./packages/game-engine
COPY apps/server ./apps/server

RUN pnpm --filter=@board-hub/game-engine build
RUN pnpm --filter=server build

WORKDIR /app/apps/server

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/apps/server/src/main"]
