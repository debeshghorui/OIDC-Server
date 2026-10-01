import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("8080"),
    DATABASE_URL: z.string().optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
    const safeParsedEnv = envSchema.safeParse(env);

    if (!safeParsedEnv.success) {
        console.error(
            "Invalid environment variables:",
            safeParsedEnv.error.format(),
        );
        throw new Error(
            `Invalid environment variables: ${safeParsedEnv.error.message}`,
        );
    }

    return safeParsedEnv.data;
}

export const env = createEnv(process.env);
