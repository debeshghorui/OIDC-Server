import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import {
    oauthProviderAuthServerMetadata,
    oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";

import { auth } from "./auth.js";

const app = new Hono();

app.use(logger());
app.use(cors({
    origin: "http://localhost:3000"
}));

const openIdConfigMetadata = oauthProviderOpenIdConfigMetadata(auth as never);
const authServerMetadata = oauthProviderAuthServerMetadata(auth as never);

app.get("/.well-known/openid-configuration", (c) =>
    openIdConfigMetadata(c.req.raw),
);
app.get("/.well-known/oauth-authorization-server", (c) =>
    authServerMetadata(c.req.raw),
);

// Mount betterAuth handler at /api/auth/*
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

// Health check endpoint
app.get("/", (c) => c.text("OIDC Server is running"));

export default app;
