FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY data ./data

RUN mkdir -p /app/uploads

EXPOSE 3001

CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js && node dist/server.js"]
