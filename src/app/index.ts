import express from 'express';
import type { Express } from 'express';

import authRouter from './auth/routes.js';
import oidcRouter from './oidc/routes.js';

import { authMiddleware } from './middleware/auth.middleware.js';

export function createApplication(): Express {
    const app = express();

    app.use(express.json());

    // Apply the authentication middleware globally to all routes
    app.use(authMiddleware());


    // Routers
    // OIDC routes
    app.use('/.well-known', oidcRouter);
    
    // Auth routes
    app.use('/v1/auth', authRouter)

    return app;
}