# Tasks

## 1. Package Installation and Cleanup

- [x] 1.1 Install better-auth, @better-auth/oauth-provider, @better-auth/drizzle-adapter, and hono packages using pnpm and verify packages are listed in package.json dependencies
- [x] 1.2 Remove express, jsonwebtoken, and @types/jsonwebtoken from package.json dependencies and verify removal succeeds
- [x] 1.3 Remove @types/express from devDependencies and verify removal succeeds
- [x] 1.4 Run pnpm install to clean up node_modules and verify installation completes without errors

## 2. Environment Configuration

- [x] 2.1 Generate BETTER_AUTH_SECRET (32+ character random string) and add to .env file
- [x] 2.2 Add BETTER_AUTH_URL=https://accounts.debeshghorui.com to .env file
- [x] 2.3 Verify DATABASE_URL is present in .env file (existing configuration)
- [x] 2.4 Update src/env.ts to export BETTER_AUTH_SECRET and BETTER_AUTH_URL and verify TypeScript compilation succeeds

## 3. BetterAuth Configuration

- [x] 3.1 Create src/auth.ts with betterAuth instance configured with drizzleAdapter, emailAndPassword enabled, JWT plugin, and oauthProvider plugin
- [x] 3.2 Configure oauthProvider with loginPage="/sign-in", consentPage="/consent", and allowed grant types (authorization_code, refresh_token, client_credentials, device_code)
- [x] 3.3 Configure JWT plugin for JWKS endpoint and token signing
- [x] 3.4 Add cachedTrustedClients configuration for admin-managed clients placeholder and verify configuration compiles
- [x] 3.5 Export auth instance from src/auth.ts and verify export is valid TypeScript

## 4. Database Schema Generation

- [x] 4.1 Run `npx auth generate --adapter drizzle --dialect pg` to generate betterAuth schema in drizzle/schema.ts and verify schema file is created
- [x] 4.2 Review generated schema includes user, session, account, verification, jwks, OAuth client/token/consent tables, oauthClientAssertion, and deviceCode tables
- [x] 4.3 Run `pnpm drizzle-kit generate` to create migration file for new schema and verify migration file is created in drizzle/ directory
- [x] 4.4 Run `pnpm drizzle-kit migrate` to apply migration to database and verify tables are created successfully
- [x] 4.5 Drop old users table using SQL or Drizzle and verify table no longer exists (no data to preserve)

## 5. Hono Application Setup

- [x] 5.1 Create src/index.ts with Hono app instance and verify basic app compiles
- [x] 5.2 Mount betterAuth handler at /api/auth/* using `app.all("/api/auth/*", (c) => auth.handler(c.req.raw))` and verify route is registered
- [x] 5.3 Update src/server.ts to use Hono app instead of Express createServer and verify server starts without errors
- [x] 5.4 Remove src/app/index.ts (Express app factory) and verify no import errors remain
- [x] 5.5 Update package.json start script to use new Hono entry point and verify script runs successfully

## 6. Remove Custom Auth Code

- [x] 6.1 Delete src/app/auth/ directory (controller.ts, models.ts, routes.ts) and verify no import errors in codebase
- [x] 6.2 Delete src/app/oidc/ directory (controller.ts, models.ts, routes.ts, openid-configuration.ts) and verify no import errors in codebase
- [x] 6.3 Delete src/app/utils/token.ts and verify no import errors in codebase
- [x] 6.4 Delete src/app/utils/api-error.ts and verify no import errors in codebase
- [x] 6.5 Delete src/app/utils/api-response.ts and verify no import errors in codebase
- [x] 6.6 Delete src/app/middleware/auth.middleware.ts and verify no import errors in codebase
- [x] 6.7 Delete src/app/ directory if empty and verify codebase compiles without errors

## 7. OAuth Provider Pages

- [x] 7.1 Create /sign-in route in Hono app for OAuth login page and verify route responds to GET requests
- [x] 7.2 Implement login page HTML/form that integrates with Better Auth email sign-in and verify it submits to /api/auth/sign-in/email
- [x] 7.3 Create /consent route in Hono app for OAuth consent page and verify route responds to GET requests
- [x] 7.4 Implement consent page HTML/form that displays requested scopes and client information and verify form submits to /api/auth/oauth2/consent
- [x] 7.5 Add error handling for login and consent pages and verify error states display correctly

## 8. Testing OAuth Flows

- [x] 8.1 Test /.well-known/openid-configuration endpoint returns valid OIDC metadata with issuer, authorization_endpoint, token_endpoint, jwks_uri
- [x] 8.2 Test /.well-known/oauth-authorization-server endpoint returns valid OAuth 2.1 metadata with supported grant types
- [x] 8.3 Test user registration via Better Auth's /api/auth/sign-up/email endpoint with valid credentials and verify user is created in the local database
- [x] 8.4 Test user authentication via Better Auth's /api/auth/sign-in/email endpoint with valid credentials and verify session is created
- [x] 8.5 Test authorization code flow with PKCE: request authorization, receive code, exchange for tokens, and verify access_token and id_token are issued
- [x] 8.6 Test refresh token flow with offline_access scope and verify new access token is issued
- [x] 8.7 Test client credentials flow with confidential client and verify access token is issued with configured scopes
- [x] 8.8 Test device authorization flow: request device code, claim and approve as the user, poll for token, and verify access token is issued
- [x] 8.9 Test JWKS endpoint at /api/auth/jwks returns valid public keys in JWKS format
- [x] 8.10 test token introspection at /api/auth/oauth2/introspect with valid access token and verify returns active: true with metadata
- [x] 8.11 Test token revocation at /api/auth/oauth2/revoke with valid token and verify subsequent introspection returns active: false
- [x] 8.12 Test dynamic client registration at /api/auth/oauth2/register with valid redirect_uris and verify client_id and client_secret are generated
- [x] 8.13 Test UserInfo endpoint at /api/auth/oauth2/userinfo with valid access token and verify user claims are returned

## 9. Security Validation

- [x] 9.1 Verify PKCE is enforced for public clients by testing authorization request without code_challenge and verify request is rejected
- [x] 9.2 Verify exact redirect URI matching by testing authorization with mismatched redirect_uri and verify request is rejected
- [x] 9.3 Verify authorization response includes iss parameter per RFC 9207 and verify parameter is present
- [x] 9.4 Verify password hashing uses secure algorithm by checking account password hash and verifying it differs from the supplied password
- [x] 9.5 Verify rate limiting is applied to auth endpoints by testing rapid requests and verify rate limit error is returned

## 10. Documentation and Cleanup

- [x] 10.1 Update README.md with new architecture (Hono + betterAuth) and installation/usage instructions
- [x] 10.2 Update drizzle.config.js if needed for new schema and verify configuration is valid
- [x] 10.3 Remove any remaining Express-related TypeScript types from src/types/express.d.ts and verify compilation succeeds
- [x] 10.4 Run TypeScript compiler and verify no type errors
- [x] 10.5 Run linter and verify no linting errors
- [x] 10.6 Build project and verify dist/ directory is generated successfully
- [x] 10.7 Start server and verify it listens on configured port without errors
