# Luna Inmobiliaria

Sitio web de una inmobiliaria con panel de administración.

- **Frontend:** React 19 + Vite + Tailwind CSS 4 + React Router
- **Backend:** Express 5 + TypeScript + Sequelize
- **Base de datos:** PostgreSQL 17
- **Archivos:** imágenes subidas a disco y servidas desde el backend

## Estructura

```
inmo-luna/
├── inmo-luna-front/   # Sitio público (/) y panel de administración (/admin)
├── inmo-luna-back/    # API REST (/api) e imágenes (/uploads)
├── docker-compose.yml # Postgres + backend + frontend
├── .env.example       # Variables de entorno de referencia
└── Makefile           # Comandos de uso diario
```

## Puesta en marcha con Docker

1. Copiá el archivo de ejemplo y ajustá las credenciales:

   ```bash
   cp .env.example .env
   ```

2. Levantá todo:

   ```bash
   make up
   ```

3. Abrí:

   - Sitio público: <http://localhost:5173>
   - Panel admin: <http://localhost:5173/admin>
   - API: <http://localhost:3001/api>
   - Postgres: `localhost:5432`

El backend aplica las migraciones y carga las propiedades iniciales (una sola vez) al arrancar.

### Comandos útiles

| Comando | Descripción |
|---|---|
| `make up` | Construye y levanta todo en segundo plano |
| `make down` | Baja los contenedores (conserva los datos) |
| `make clean` | Baja todo y borra los volúmenes (base de datos y uploads) |
| `make logs` | Ver logs en vivo |
| `make ps` | Estado de los contenedores |
| `make migrate` | Aplicar migraciones manualmente |
| `make seed` | Ejecutar el seed manualmente |
| `make shell-back` | Abrir una shell en el contenedor del backend |

## Desarrollo local (sin Docker para front/back)

Necesitás PostgreSQL corriendo (podés usar `make db` para levantar solo la base).

```bash
pnpm install --dir inmo-luna-back
pnpm install --dir inmo-luna-front

make db                                    # Postgres en Docker
pnpm --dir inmo-luna-back db:migrate       # crear tablas
pnpm --dir inmo-luna-back db:seed          # cargar datos iniciales
make dev                                   # frontend :5173 + backend :3001
```

## Variables de entorno

Todas viven en el único `.env` de la raíz.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del backend (3001) |
| `ADMIN_USER` | Usuario del panel |
| `ADMIN_PASS` | Contraseña del panel |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `UPLOAD_DIR` | Carpeta de imágenes (dentro de Docker: `/app/uploads`) |
| `MAX_FILE_SIZE` | Tamaño máximo por imagen, en bytes (5 MB) |
| `VITE_API_URL` | URL de la API que usa el frontend |
| `VITE_TOKEN_KEY` | Clave de `localStorage` para el token |

> `VITE_*` se inyecta en el build del frontend. En Docker se usa `/api` y Nginx hace de proxy al backend, por lo que no hay CORS ni URLs absolutas.

## API

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/login` | No | Devuelve un JWT |
| `GET` | `/api/properties` | No | Lista de propiedades con imágenes |
| `GET` | `/api/properties/:id` | No | Detalle de una propiedad |
| `POST` | `/api/properties` | Sí | Crea una propiedad |
| `PUT` | `/api/properties/:id` | Sí | Edita una propiedad |
| `DELETE` | `/api/properties/:id` | Sí | Elimina una propiedad y sus imágenes |
| `POST` | `/api/properties/:id/images` | Sí | Sube imágenes (`multipart/form-data`, campo `imagenes`) |
| `DELETE` | `/api/properties/:propertyId/images/:imageId` | Sí | Elimina una imagen |

Formatos de imagen aceptados: JPG, PNG y WEBP (máximo 5 MB cada una).

## Datos y respaldos

- La base de datos vive en el volumen `postgres_data`.
- Las imágenes viven en el volumen `uploads_data`.
- Para respaldar: `docker compose exec db pg_dump -U luna inmo_luna > backup.sql`.

## Notas

- El antiguo archivo `inmo-luna-back/data/properties.json` se usa solo como fuente del seed inicial.
