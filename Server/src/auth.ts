import { betterAuth, type Auth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { jwt } from "better-auth/plugins";
import {
    DEVICE_CODE_GRANT_TYPE,
    oauthDeviceAuthorization,
    oauthProvider,
} from "@better-auth/oauth-provider";
import { db } from "./db/index.js";
import { env } from "./env.js";

const authOptions: BetterAuthOptions = {
    baseURL: env.BETTER_AUTH_URL,
    rateLimit: {
        enabled: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        jwt({
            jwt: {
                issuer: env.BETTER_AUTH_URL,
            },
        }),
        oauthProvider({
            loginPage: "/sign-in",
            consentPage: "/consent",
            grantTypes: [
                "authorization_code",
                "refresh_token",
                "client_credentials",
                DEVICE_CODE_GRANT_TYPE,
            ],
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: true,
            clients: {
                cachedTrustedClients: {
                    // Placeholder for admin-managed clients
                    // Add first-party clients here when needed
                },
            },
        }),
        oauthDeviceAuthorization(),
    ],
};

export const auth: Auth<typeof authOptions> = betterAuth(authOptions);
