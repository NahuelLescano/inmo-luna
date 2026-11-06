# Deploy: Vercel + Railway

Guía para publicar la demo:

- **Frontend:** Vercel (estático)
- **Backend + PostgreSQL + imágenes:** Railway

> El orden recomendado es: primero Railway para obtener la URL de la API, después Vercel con esa URL, y por último actualizar `FRONTEND_URL` en Railway.

## 1. Subir el código a GitHub

El repositorio ya está en GitHub. Asegurate de que la rama elegida (por ejemplo `deploy` o `master`) esté pusheada:

```bash
git push origin deploy
```

## 2. Railway (backend)

1. Entrá a <https://railway.com> y creá un proyecto nuevo.
2. Elegí **Deploy from GitHub repo** y seleccioná `NahuelLescano/inmo-luna`.
3. Configurá el servicio del backend:
   - **Root Directory:** `inmo-luna-back`
   - Railway detecta el `Dockerfile` y el `railway.json`.
4. Agregá PostgreSQL:
   - **New → Database → PostgreSQL**.
5. En el servicio del backend, agregá las variables:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `ADMIN_USER` | tu usuario |
   | `ADMIN_PASS` | una contraseña segura |
   | `JWT_SECRET` | un secreto largo y aleatorio |
   | `UPLOAD_DIR` | `/app/uploads` |
   | `FRONTEND_URL` | la URL de Vercel (se completa en el paso 3) |

6. Agregá un volumen:
   - **New → Volume**
   - Mount path: `/app/uploads`

   Sin este volumen las imágenes se pierden en cada deploy.

7. Generá un dominio público:
   - **Settings → Networking → Generate Domain**
   - Guardá la URL, por ejemplo `https://inmo-luna-back-production.up.railway.app`.

8. Verificá el deploy en los logs:
   - Debe aplicar migraciones.
   - Debe ejecutar el seed una sola vez.
   - El healthcheck es `/api/health`.

## 3. Vercel (frontend)

1. Entrá a <https://vercel.com> e importá el repo `NahuelLescano/inmo-luna`.
2. Configuración del proyecto:
   - **Root Directory:** `inmo-luna-front`
   - **Framework Preset:** Vite
   - Vercel toma `vercel.json` para build, output y rewrites.
3. Variables de entorno (para Production y Preview):

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://<tu-dominio-railway>/api` |
   | `VITE_TOKEN_KEY` | `luna_admin_token` |

4. Deployá y guardá la URL, por ejemplo `https://inmo-luna.vercel.app`.

## 4. Conectar los dos

1. En Railway, actualizá `FRONTEND_URL` con la URL de Vercel:
   ```text
   https://inmo-luna.vercel.app
   ```
   Si tenés más de un dominio, separalos con coma.

2. Railway va a redeployar el backend automáticamente.

3. Probá:
   - `https://<railway>/api/health` → `{ "ok": true }`
   - `https://<vercel>/` → sitio público
   - `https://<vercel>/admin` → login
   - Crear una propiedad y subir una imagen.

## Variables de entorno

### Railway

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_USER=admin
ADMIN_PASS=una_clave_segura
JWT_SECRET=un_secreto_largo_y_aleatorio
UPLOAD_DIR=/app/uploads
FRONTEND_URL=https://tu-front.vercel.app
```

### Vercel

```env
VITE_API_URL=https://tu-back.up.railway.app/api
VITE_TOKEN_KEY=luna_admin_token
```

## Notas importantes

- El **Free Trial de Railway** incluye $5 de crédito por 30 días. Si se agota, los servicios se detienen.
- Los volúmenes del trial se eliminan 30 días después de que expiran los créditos. Para una demo no hay problema: el seed vuelve a cargar las propiedades.
- Vercel Hobby es para uso **personal/no comercial**. Para producción de un cliente corresponde Vercel Pro o Cloudflare Pages.
- Cambiá `ADMIN_PASS` y `JWT_SECRET` antes de compartir la demo.
- Si usás un dominio propio, agregalo en Vercel y en `FRONTEND_URL`.

## Actualizaciones

Con los deploys conectados a GitHub, cada push a la rama configurada redeploya automáticamente.

Si cambiás `VITE_API_URL`, tenés que redeployar el frontend porque Vite la inyecta en el build.
