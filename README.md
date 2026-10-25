# OIDC Server

An OAuth 2.1 and OpenID Connect authorization server built with Hono, Better Auth, and PostgreSQL. Better Auth handles email/password authentication, sessions, OAuth clients and tokens, device authorization, and JWT signing keys.

## Requirements

- Node.js
- pnpm
- PostgreSQL

## Local setup

Install dependencies and start PostgreSQL:

```sh
pnpm install
pnpm db:up
```

Create a `.env` file in the project root with:

```dotenv
PORT=8080
DATABASE_URL=postgresql://postgres:password@localhost:5433/todo_app
BETTER_AUTH_SECRET=<a random secret with at least 32 characters>
BETTER_AUTH_URL=http://localhost:8080
```

Generate a secret with `openssl rand -base64 32`. Apply the database migrations, compile the server, and start it:

```sh
pnpm db:migrate
pnpm build
pnpm start
```

The server listens on `PORT` (8080 by default). For development with automatic restarts, run `pnpm dev`.

## OAuth and OIDC endpoints

The discovery documents are available at:

- `/.well-known/openid-configuration`
- `/.well-known/oauth-authorization-server`

Better Auth endpoints are mounted under `/api/auth`, including:

- Email registration and sign-in: `/api/auth/sign-up/email`, `/api/auth/sign-in/email`
- Authorization and token exchange: `/api/auth/oauth2/authorize`, `/api/auth/oauth2/token`
- Consent submission: `/api/auth/oauth2/consent`
- Dynamic client registration: `/api/auth/oauth2/register`
- UserInfo, introspection, and revocation: `/api/auth/oauth2/userinfo`, `/api/auth/oauth2/introspect`, `/api/auth/oauth2/revoke`
- Signing keys: `/api/auth/jwks`
- Device authorization: `/api/auth/device/code`, `/api/auth/device`, `/api/auth/device/approve`, `/api/auth/device/deny`

The built-in `/sign-in` and `/consent` pages continue OAuth authorization requests. Public clients must use S256 PKCE, and redirect URIs are matched exactly. Auth endpoints use Better Auth rate limiting.

## Database commands

Drizzle Kit reads `src/db/schema.ts` and `drizzle.config.js`:

```sh
pnpm db:generate
pnpm db:migrate
pnpm studio
```

`pnpm db:down` stops the local PostgreSQL container.
