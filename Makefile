.PHONY: all up down build logs ps db shell-back migrate seed dev front back

all: up

# Levanta todo (Postgres + backend + frontend) en segundo plano.
up:
	docker compose up --build -d

# Baja los contenedores (los datos quedan en los volúmenes).
down:
	docker compose down

# Baja los contenedores y borra también los volúmenes (base de datos y uploads).
clean:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

# Levanta solo Postgres (útil para trabajar con pnpm dev en local).
db:
	docker compose up -d db

shell-back:
	docker compose exec back sh

migrate:
	docker compose exec back node dist/db/migrate.js

seed:
	docker compose exec back node dist/db/seed.js

# Desarrollo local sin contenedores para front y back.
dev: front back

front:
	@cd inmo-luna-front && pnpm dev

back:
	@cd inmo-luna-back && pnpm dev
