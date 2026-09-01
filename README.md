# Saviia PH — Reservas de espacios comunes

App web para reservar los espacios comunes del Conjunto Residencial Saviia PH
(Gimnasio, Piscina, Salón Coworking, Salón de Juegos para Adultos y Salón de
Juegos Infantil), respetando las reglas de los Manuales de Uso oficiales
(horarios, aforo, anticipación mínima, límites por unidad). El inicio de
sesión es con el correo de Gmail de cada residente, validado contra una
lista blanca administrada desde el panel `/admin`.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS, NextAuth (Auth.js)
con Google, Prisma sobre SQLite/Turso (libSQL).

## Configuración local

1. Copia `.env.example` a `.env.local` y completa las variables:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: credenciales OAuth de
     Google Cloud Console (redirect URI: `/api/auth/callback/google`).
   - `AUTH_SECRET`: genera uno con `npx auth secret`.
   - `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`: de tu base de datos en
     [Turso](https://turso.tech). Para desarrollo local puedes usar
     `TURSO_DATABASE_URL="file:./prisma/dev.db"` sin token.
2. Instala dependencias (esto también corre `prisma generate` vía
   `postinstall`) y prepara la base de datos:

   ```bash
   npm install
   npm run db:migrate   # crea las tablas (solo funciona contra file:./prisma/dev.db)
   npm run db:seed      # siembra los 5 espacios + el admin inicial
   npm run dev
   ```

El admin inicial se siembra con el correo definido en `SEED_ADMIN_EMAIL`
(o el valor por defecto en `prisma/seed.ts`) — solo ese correo (y los que
agregues luego desde `/admin`) podrán iniciar sesión.

### Aplicar el esquema a una base de datos Turso real

El motor de migración de Prisma 7 todavía no entiende el esquema
`libsql://` (solo `file:`, `postgres:`, etc.), así que `prisma migrate
dev/deploy` **no funciona** apuntando a Turso — falla con `P1013`. Para
aplicar las tablas a una base Turso real, usa el script que ejecuta el SQL
generado directamente vía `@libsql/client` (el mismo driver que usa la app
en tiempo de ejecución):

```bash
npm run db:migrate:turso   # aplica prisma/migrations/*.sql contra Turso
npm run db:seed            # esto sí funciona igual contra Turso (usa el adapter, no el motor de migración)
```

`db:migrate:turso` es idempotente: guarda en una tabla `_saviia_migrations`
qué migraciones ya corrieron, así que se puede volver a ejecutar sin
duplicar nada cada vez que agregues una migración nueva.

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com):

1. Antes del primer deploy, corre localmente `npm run db:migrate:turso` y
   `npm run db:seed` apuntando (via `.env.local`) a tu base de datos Turso
   de producción, para dejarla con las tablas y los datos iniciales.
2. En el dashboard del proyecto en Vercel, configura las mismas variables
   de entorno de `.env.example` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `AUTH_SECRET`, `NEXTAUTH_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
3. Deploy. El `postinstall` (`prisma generate`) corre automáticamente en
   cada build de Vercel — no necesitas correrlo tú.

## Estructura relevante

- `prisma/schema.prisma`, `prisma/seed.ts` — modelo de datos y siembra.
- `src/lib/spaces.ts` — reglas de cada espacio, traducidas de los manuales.
- `src/lib/booking-rules.ts` — validación de reservas (horarios, aforo,
  anticipación, límites por unidad).
- `src/lib/auth.ts` — NextAuth con Google y validación contra la lista
  blanca de residentes.
- `src/app/dashboard`, `src/app/espacios/[slug]` — UI de reserva.
- `src/app/admin` — panel de administración de residentes y reservas.
- `src/proxy.ts` — protección de rutas (convención `proxy.ts` de Next 16,
  reemplazo de `middleware.ts`).
