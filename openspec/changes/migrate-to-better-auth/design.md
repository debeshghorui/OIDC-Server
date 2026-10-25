# Design

## Context

Current implementation uses Express with custom authentication:
- Custom user table with HMAC-SHA256 password hashing
- Manual JWT token generation and verification
- Static OIDC configuration document only
- No functional OAuth flows (authorization code, token endpoint, JWKS, refresh tokens, device authorization declared but not implemented)
- Custom auth controllers, routes, and middleware in src/app/auth/ and src/app/oidc/
- PostgreSQL with Drizzle ORM
- No existing user data to migrate (clean slate)

Database: PostgreSQL with Drizzle ORM already configured.
Issuer URL: https://accounts.debeshghorui.com (production domain).

See proposal.md for motivation and detailed what changes.

## Goals / Non-Goals

**Goals:**
- Replace custom auth with production-grade OAuth 2.1 + OIDC implementation
- Improve security posture with proper password hashing, PKCE, and OAuth 2.1 compliance
- Reduce maintenance burden by leveraging betterAuth instead of custom implementation
- Support all declared OAuth flows (authorization code, refresh tokens, client credentials, device authorization)
- Provide JWKS endpoint and token introspection/revocation
- Enable both admin-managed and dynamic client registration

**Non-Goals:**
- Social providers (Google, GitHub, etc.) - deferred to future work
- Multi-tenancy or organization features
- 2FA or passkey authentication
- Custom token formats beyond OAuth 2.1/OIDC standards
- API key management

## Decisions

### Framework: Hono instead of Express

**Rationale:**
- Hono natively supports Web Standard Request/Response APIs
- betterAuth integrates natively with Hono (no adapter needed)
- Lighter weight and better performance than Express
- Better TypeScript inference
- Simpler configuration for edge deployment if needed later

**Alternatives considered:**
- Express: Current framework, but requires adapter (`toNodeHandler`) and is heavier
- Fastify: Similar performance to Hono, but requires adapter
- Next.js/Nuxt: Overkill for this use case

### Database Schema: betterAuth schema over custom

**Rationale:**
- betterAuth provides production-tested schema with proper indexes and constraints
- Includes session management, account linking, and verification tables out of the box
- OAuth provider plugin adds OAuth-specific tables (clients, tokens, consent)
- No user data to migrate, so schema change cost is minimal

**Alternatives considered:**
- Extend custom schema: Would require implementing betterAuth's schema manually, higher maintenance burden
- Hybrid approach: Too complex, betterAuth expects its schema

### Password Hashing: betterAuth's default (configurable)

**Rationale:**
- betterAuth uses secure algorithms (bcrypt/scrypt/argon2) by default
- Configurable if specific algorithm needed
- Removes need for custom HMAC-SHA256 implementation

**Alternatives considered:**
- Keep HMAC-SHA256: Less secure, not recommended for passwords
- Custom bcrypt: Reimplementing what betterAuth provides

### OAuth Provider: @better-auth/oauth-provider plugin

**Rationale:**
- Provides complete OAuth 2.1 + OIDC implementation
- Includes all required flows (authorization code, refresh, client credentials, device)
- Auto-generates discovery endpoints
- Built-in client management and consent screens
- OAuth 2.1 security defaults (PKCE, exact redirect URI matching, RFC 9207 iss parameter)

**Alternatives considered:**
- Custom OAuth implementation: Extremely complex, security risk
- Node OIDC Provider: More mature but heavier, not integrated with betterAuth

### Client Registration: Both admin-managed and dynamic

**Rationale:**
- Admin-managed: Control over first-party applications, can bypass consent
- Dynamic: Allows external developers to register their applications
- Flexibility for current and future use cases

**Alternatives considered:**
- Admin-managed only: Less flexible, requires manual onboarding
- Dynamic only: Less control, security concerns for first-party apps

### Database Adapter: @better-auth/drizzle-adapter

**Rationale:**
- Project already uses Drizzle ORM
- Seamless integration with existing database setup
- BetterAuth CLI can generate Drizzle schema automatically

**Alternatives considered:**
- Kysely adapter: Would require migration from Drizzle
- Prisma adapter: Would require migration from Drizzle

## Risks / Trade-offs

### Risk: Learning curve for betterAuth API

**Mitigation:**
- betterAuth has comprehensive documentation
- Community examples available
- Simplifies auth complexity overall despite initial learning

### Risk: Larger dependency footprint

**Mitigation:**
- Trade-off is acceptable for production-grade security
- BetterAuth is actively maintained and used by major companies
- Reduces custom code maintenance burden

### Risk: Database schema migration complexity

**Mitigation:**
- No existing user data to migrate (clean slate)
- BetterAuth CLI generates schema automatically
- Drizzle migrations are well-tested

### Risk: Framework migration (Express to Hono)

**Mitigation:**
- No existing API contracts to maintain (custom auth endpoints being removed)
- Hono has similar API patterns to Express
- betterAuth handles most auth complexity regardless of framework

### Trade-off: Loss of custom auth endpoint control

**Mitigation:**
- betterAuth provides configuration options for customization
- Can add custom routes alongside betterAuth handler if needed
- Standard OAuth 2.1 endpoints are more valuable than custom ones

## Migration Plan

### Phase 1: Setup and Configuration
1. Install packages: better-auth, @better-auth/oauth-provider, @better-auth/drizzle-adapter, hono
2. Remove Express and custom auth dependencies
3. Set environment variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL
4. Create auth.ts with betterAuth configuration
5. Configure Drizzle adapter with PostgreSQL connection

### Phase 2: Database Migration
1. Run `npx auth generate --adapter drizzle --dialect pg` to generate schema
2. Review generated schema (user, session, account, verification, oauthClient, oauthRefreshToken, oauthAccessToken, oauthConsent, oauthClientAssertion)
3. Run Drizzle migrations to create new tables
4. Drop old users table (no data to preserve)

### Phase 3: Hono Integration
1. Create Hono app in src/index.ts
2. Mount betterAuth handler at /api/auth/*
3. Remove Express server and custom auth routes
4. Remove src/app/auth/ and src/app/oidc/ directories
5. Remove custom auth utilities (token.ts, api-error.ts, api-response.ts)

### Phase 4: OAuth Provider Configuration
1. Configure oauthProvider plugin with login and consent page paths
2. Set up cachedTrustedClients for admin-managed clients
3. Enable dynamic client registration
4. Configure allowed grant types
5. Add JWT plugin for JWKS endpoint

### Phase 5: UI Pages
1. Implement login page (Hono route) for OAuth authorization
2. Implement consent page (Hono route) for user authorization
3. Integrate with betterAuth's session management

### Phase 6: Testing and Validation
1. Test /.well-known endpoints (openid-configuration, oauth-authorization-server)
2. Test authorization code flow with PKCE
3. Test refresh token flow
4. Test client credentials flow
5. Test device authorization flow
6. Test token introspection and revocation
7. Test dynamic client registration
8. Validate OIDC compliance

### Rollback Strategy
- Keep Git branch for easy revert
- Database migrations can be rolled back with Drizzle
- No user data to preserve simplifies rollback

## Open Questions

None - all decisions are clear and can be implemented as specified.
