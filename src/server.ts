import { serve } from "@hono/node-server";
import { env } from "./env.js";
import app from "./index.js";

async function main() {
    try {
        const port = Number(env.PORT);
        serve({ fetch: app.fetch, port }, (info) => {
            console.log(`Server is listening on port ${info.port}`);
            console.log(`Server URL: http://localhost:${info.port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        throw error;
    }
}

main();
