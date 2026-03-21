# Palladium Parking Frontend

Frontend administrativo para la gestión de parqueo de Palladium Parking, construido con React y Vite.

## Resumen

Este proyecto incluye:

- Autenticación JWT con access token y refresh token.
- Refresh automático en respuestas 401.
- Manejo de rate limit (429) con mensaje al usuario.
- Rutas protegidas y flujo de logout con revoke token.
- Módulos de sesiones, caja, vehículos, tarifas, suscripciones y usuarios.

## Stack

- React 19
- Vite
- React Router
- Axios
- ESLint

## Requisitos

- Node.js 18 o superior
- npm

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno a partir de `.env.example`:

```bash
cp .env.example .env
```

3. Ajustar la URL del backend en `.env`:

```env
VITE_API_BASE_URL=https://localhost:44363/api
```

## Scripts

- `npm run dev`: inicia el entorno de desarrollo.
- `npm run build`: genera el build de producción.
- `npm run preview`: previsualiza el build.
- `npm run lint`: ejecuta validaciones de lint.

## Seguridad y autenticación

- El frontend agrega `Authorization: Bearer <accessToken>` automáticamente a peticiones protegidas.
- Si una petición devuelve 401, intenta refrescar sesión con `/User/refresh` y reintenta la petición original.
- Si el refresh falla, limpia la sesión y redirige a login.
- El logout llama `/User/revoke` con el refresh token.
- Actualmente los tokens se guardan en memoria (no localStorage para JWT).

## Endpoints públicos esperados

Según la configuración actual del backend, los públicos son:

- `POST /api/User`
- `POST /api/User/login`
- `POST /api/User/refresh`
- `POST /api/User/revoke`
- `GET /api/rates`
- `GET /api/subscriptions/prices`

El resto de endpoints deben requerir JWT.

## Estructura principal

```text
src/
  api/
  components/
  context/
  hooks/
  layouts/
  pages/
  services/
  utils/
```

## Despliegue

Para desplegar en producción:

1. Configurar `.env.production` con la URL de API correcta.
2. Ejecutar `npm run build`.
3. Publicar el contenido de `dist/` en tu hosting.

## Notas

- No subir archivos `.env` con datos reales.
- Mantener actualizado `.env.example` cuando cambien variables requeridas.
