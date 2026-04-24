FROM node:22-bookworm AS api

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY tsconfig.base.json prisma.config.ts ./
COPY prisma prisma
COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run db:generate \
  && npm run build -w @ai-ops-studio/shared \
  && npm run build -w @ai-ops-studio/api

EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]
