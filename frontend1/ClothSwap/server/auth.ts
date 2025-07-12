import type { Express, Request, Response, NextFunction } from "express";

// Import the Replit-specific implementation lazily so that local installs
// **never** evaluate the file (and its env-var checks) unless explicitly enabled.
let useReplitAuth = process.env.USE_REPLIT_AUTH === "true";

let replitImpl: {
  setupAuth?: (app: Express) => Promise<void> | void;
  isAuthenticated?: (req: Request, res: Response, next: NextFunction) => void;
} = {};

if (useReplitAuth) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    replitImpl = require("./replitAuth");
  } catch (err) {
    console.warn("Replit auth selected but './replitAuth' could not be loaded:", err);
    useReplitAuth = false;
  }
}

/**
 * Sets up authentication middleware.  If `USE_REPLIT_AUTH=true`, delegates to
 * the existing Replit OIDC implementation.  Otherwise it becomes a no-op so
 * the server can run locally without extra credentials.
 */
export async function setupAuth(app: Express) {
  if (useReplitAuth && replitImpl.setupAuth) {
    return replitImpl.setupAuth(app);
  }
  // local / no-auth mode – stub auth endpoints so frontend works
  app.get("/api/login", (_req, res) => {
    res.json({ message: "login skipped in local mode" });
  });
  app.get("/api/logout", (_req, res) => {
    res.json({ message: "logged out" });
  });
  app.get("/api/callback", (_req, res) => {
    res.redirect("/");
  });
}

/**
 * Middleware that enforces an authenticated user *only* when Replit auth is
 * enabled.  In local mode it simply calls `next()`.
 */
export function isAuthenticated(req: Request, _res: Response, next: NextFunction) {
  if (useReplitAuth && replitImpl.isAuthenticated) {
    return (replitImpl.isAuthenticated as any)(req, _res, next);
  }
  // Inject a dummy user object so downstream code that expects req.user works.
  if (!useReplitAuth) {
    (req as any).user = {
      claims: { sub: "local-user" },
    };
  }
  next();
}
