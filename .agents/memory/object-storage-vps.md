---
name: Object Storage VPS Guard
description: How to safely use Replit Object Storage when the app also runs on an external VPS.
---

## Rule
Always check `await isSidecarAvailable()` before any `objectStorageClient` call.

**Why:** Replit's Object Storage sidecar (`@google-cloud/storage` ExternalAccountCredentials) fetches auth from `http://127.0.0.1:1106/credential`. This port only exists inside Replit containers. On the VPS (Hostinger 187.124.223.34) it throws `ECONNREFUSED`, which surfaces as a 400 error to the frontend.

**How to apply:**
- `isSidecarAvailable()` — module-level cached async function in `server/routes.ts`, checks port 1106 with a 400ms timeout and caches the boolean.
- Pattern: `if (searchPaths.length > 0 && await isSidecarAvailable()) { /* use GCS */ } else { /* local disk */ }`
- All fallback `fs.writeFileSync()` calls should be preceded by `fs.mkdirSync(uploadDir, { recursive: true })`.

**VPS update command (must include build step):**
```
cd /var/www/protels && git pull && npm run build && pm2 restart protels
```
Skipping `npm run build` means compiled `dist/` is old code — just `pm2 restart` won't pick up TS changes.
