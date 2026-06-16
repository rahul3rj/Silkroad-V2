// src/app/api/auth/[...nextauth]/route.ts
// Auth.js v5 catch-all route handler.
// This single file handles ALL Auth.js HTTP traffic:
//   GET  /api/auth/session, /api/auth/csrf, /api/auth/providers
//   GET  /api/auth/callback/:provider
//   POST /api/auth/signin/:provider, /api/auth/signout

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
