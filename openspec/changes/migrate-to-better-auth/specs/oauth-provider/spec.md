# Spec Delta

## Purpose

Provides a production-grade OAuth 2.1 authorization server with OpenID Connect support for external applications to authenticate users and obtain access tokens.

## ADDED Requirements

### Requirement: Authorization code flow with PKCE
The system SHALL support OAuth 2.1 authorization code flow with S256 PKCE for public clients.

#### Scenario: Successful authorization code flow
- **WHEN** a client requests authorization with valid client_id, redirect_uri, code_challenge, and code_challenge_method
- **THEN** system returns authorization code
- **AND** system stores code_challenge for verification

#### Scenario: Token exchange with PKCE verification
- **WHEN** client exchanges authorization code with valid code_verifier
- **THEN** system verifies code_verifier matches stored code_challenge
- **AND** system issues access token and ID token

### Requirement: Refresh token flow
The system SHALL support refresh token flow when offline_access scope is requested.

#### Scenario: Refresh access token
- **WHEN** client presents valid refresh token
- **THEN** system issues new access token
- **AND** system may issue new refresh token

#### Scenario: Invalid refresh token
- **WHEN** client presents expired or revoked refresh token
- **THEN** system rejects request with error

### Requirement: Client credentials flow
The system SHALL support machine-to-machine client credentials flow for confidential clients.

#### Scenario: Client credentials token
- **WHEN** confidential client authenticates with client_secret
- **THEN** system issues access token
- **AND** access token has configured scopes

### Requirement: Device authorization flow
The system SHALL support device authorization flow for CLI and limited-input clients.

#### Scenario: Device code authorization
- **WHEN** client requests device code
- **THEN** system returns device_code and user_code
- **AND** system provides verification URI

#### Scenario: Device code polling
- **WHEN** client polls for token with valid device_code
- **THEN** system returns access token after user authorization
- **OR** system returns pending status until authorization

### Requirement: OpenID Connect ID tokens
The system SHALL issue signed ID tokens when openid scope is requested.

#### Scenario: ID token issuance
- **WHEN** client requests openid scope in authorization
- **THEN** system includes id_token in token response
- **AND** id_token contains standard claims (iss, sub, aud, exp, iat)

#### Scenario: UserInfo endpoint
- **WHEN** client requests /oauth2/userinfo with valid access token
- **THEN** system returns user claims
- **AND** claims correspond to requested scopes

### Requirement: JWKS endpoint
The system SHALL expose JWKS endpoint for token signature verification.

#### Scenario: JWKS retrieval
- **WHEN** client requests JWKS endpoint
- **THEN** system returns public keys in JWKS format
- **AND** keys include key ID and algorithm

### Requirement: Token introspection
The system SHALL support token introspection for resource servers.

#### Scenario: Introspect access token
- **WHEN** resource server introspects valid access token
- **THEN** system returns token metadata (active, scope, client_id, exp)

#### Scenario: Introspect invalid token
- **WHEN** resource server introspects invalid or expired token
- **THEN** system returns active: false

### Requirement: Token revocation
The system SHALL support token revocation.

#### Scenario: Revoke access token
- **WHEN** client requests revocation with valid token
- **THEN** system invalidates the token
- **AND** subsequent introspection returns active: false

### Requirement: OAuth discovery endpoints
The system SHALL serve OAuth 2.1 and OIDC discovery metadata at /.well-known endpoints.

#### Scenario: OpenID Connect discovery
- **WHEN** client requests /.well-known/openid-configuration
- **THEN** system returns OIDC provider metadata
- **AND** metadata includes issuer, authorization_endpoint, token_endpoint, jwks_uri

#### Scenario: OAuth authorization server metadata
- **WHEN** client requests /.well-known/oauth-authorization-server
- **THEN** system returns OAuth 2.1 metadata
- **AND** metadata includes supported grant types and response types

### Requirement: Client registration
The system SHALL support both admin-managed and dynamic client registration.

#### Scenario: Dynamic client registration
- **WHEN** client registers with valid redirect_uris and metadata
- **THEN** system generates client_id and client_secret
- **AND** system stores client configuration

#### Scenario: Trusted client bypass
- **WHEN** trusted client (admin-managed) requests authorization
- **THEN** system may bypass consent screen if configured

### Requirement: OAuth consent screens
The system SHALL support user consent prompts for authorization requests.

#### Scenario: Consent screen display
- **WHEN** user is redirected to authorization endpoint
- **THEN** system displays consent screen with requested scopes
- **AND** user must approve before authorization code is issued

#### Scenario: Consent persistence
- **WHEN** user has previously consented to client
- **THEN** system may skip consent screen for subsequent requests

### Requirement: Public and confidential clients
The system SHALL support both public clients (no secret) and confidential clients (with secret).

#### Scenario: Public client authentication
- **WHEN** public client (token_endpoint_auth_method: none) requests token
- **THEN** system authenticates via PKCE only
- **AND** system does not require client_secret

#### Scenario: Confidential client authentication
- **WHEN** confidential client requests token
- **THEN** system authenticates via client_secret_basic or client_secret_post
- **AND** system validates client_secret

### Requirement: OAuth 2.1 security compliance
The system SHALL enforce OAuth 2.1 security best practices.

#### Scenario: PKCE requirement for public clients
- **WHEN** public client requests authorization
- **THEN** system requires code_challenge and code_challenge_method
- **AND** system rejects requests without PKCE

#### Scenario: Exact redirect URI matching
- **WHEN** client requests authorization
- **THEN** system validates redirect_uri exactly matches registered URIs
- **AND** system rejects mismatched redirect URIs

#### Scenario: Issuer parameter in authorization response
- **WHEN** system returns authorization response
- **THEN** system includes iss parameter per RFC 9207
- **AND** this prevents authorization-server mix-up attacks
