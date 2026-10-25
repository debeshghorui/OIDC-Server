-- Drop old users table (no data to preserve)
DROP TABLE IF EXISTS "users" CASCADE;

-- Create betterAuth core tables
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "user_email_unique" ON "user"("email");

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
CREATE INDEX "session_userId_idx" ON "session"("user_id");
CREATE UNIQUE INDEX "session_token_unique" ON "session"("token");
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;

CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"expires_at" timestamp,
	"password" text
);
CREATE UNIQUE INDEX "account_provider_id_account_id_idx" ON "account"("provider_id", "account_id");
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL,
	"kid" text NOT NULL
);

-- Create OAuth provider tables
CREATE TABLE "oauth_client" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text,
	"name" text NOT NULL,
	"redirect_uris" jsonb NOT NULL,
	"post_logout_redirect_uris" jsonb,
	"scopes" jsonb NOT NULL,
	"grant_types" jsonb NOT NULL,
	"token_endpoint_auth_method" text NOT NULL,
	"response_type" text NOT NULL,
	"client_type" text NOT NULL,
	"application_type" text NOT NULL,
	"subject_type" text,
	"sector_identifier_uri" text,
	"jwks_uri" text,
	"jwks" jsonb,
	"request_uris" jsonb,
	"metadata" jsonb,
	"disabled" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "oauth_client_userId_idx" ON "oauth_client"("user_id");
CREATE UNIQUE INDEX "oauth_client_client_id_unique" ON "oauth_client"("client_id");
ALTER TABLE "oauth_client" ADD CONSTRAINT "oauth_client_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;

CREATE TABLE "oauth_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"name" text NOT NULL,
	"scope" text NOT NULL,
	"scope_description" text,
	"icon_uri" text,
	"audience" jsonb NOT NULL,
	"display_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "oauth_resource_resourceId_idx" ON "oauth_resource"("resource_id");
CREATE UNIQUE INDEX "oauth_resource_resource_id_unique" ON "oauth_resource"("resource_id");

CREATE TABLE "oauth_client_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "oauth_client_resource_clientId_resourceId_idx" ON "oauth_client_resource"("client_id", "resource_id");
ALTER TABLE "oauth_client_resource" ADD CONSTRAINT "oauth_client_resource_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_client"("id") ON DELETE cascade ON update no action;
ALTER TABLE "oauth_client_resource" ADD CONSTRAINT "oauth_client_resource_resource_id_oauth_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "oauth_resource"("id") ON DELETE cascade ON update no action;

CREATE TABLE "oauth_refresh_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL
);
CREATE INDEX "oauth_refresh_token_clientId_idx" ON "oauth_refresh_token"("client_id");
CREATE INDEX "oauth_refresh_token_userId_idx" ON "oauth_refresh_token"("user_id");
CREATE UNIQUE INDEX "oauth_refresh_token_token_unique" ON "oauth_refresh_token"("token");
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_client"("id") ON DELETE cascade ON update no action;
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;

CREATE TABLE "oauth_access_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text,
	"scopes" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resource_id" text
);
CREATE INDEX "oauth_access_token_clientId_idx" ON "oauth_access_token"("client_id");
CREATE INDEX "oauth_access_token_userId_idx" ON "oauth_access_token"("user_id");
CREATE UNIQUE INDEX "oauth_access_token_token_unique" ON "oauth_access_token"("token");
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_client"("id") ON DELETE cascade ON update no action;
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_resource_id_oauth_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "oauth_resource"("id") ON DELETE cascade ON update no action;

CREATE TABLE "oauth_consent" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
CREATE UNIQUE INDEX "oauth_consent_clientId_userId_idx" ON "oauth_consent"("client_id", "user_id");
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_client"("id") ON DELETE cascade ON update no action;
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON update no action;

CREATE TABLE "oauth_client_assertion" (
	"id" text PRIMARY KEY NOT NULL,
	"jti" text NOT NULL,
	"client_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "oauth_client_assertion_clientId_idx" ON "oauth_client_assertion"("client_id");
CREATE UNIQUE INDEX "oauth_client_assertion_jti_unique" ON "oauth_client_assertion"("jti");
ALTER TABLE "oauth_client_assertion" ADD CONSTRAINT "oauth_client_assertion_client_id_oauth_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_client"("id") ON DELETE cascade ON update no action;
