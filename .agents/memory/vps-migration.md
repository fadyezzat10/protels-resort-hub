---
name: VPS Migration
description: PROTELS app migrated to Hostinger Ubuntu 24.04 VPS — key decisions and pending steps
---

# VPS Migration Details

## VPS Info
- IP: 187.124.223.34
- User: root
- OS: Ubuntu 24.04 LTS
- App dir: /var/www/protels

## Stack on VPS
- Node.js 20.20.2
- PostgreSQL 16 (local, user: protels, db: protelsdb)
- Nginx 1.24 (port 80/443)
- PM2 7.0.3 (process name: protels)

## Key Decisions
- Object storage replaced with local filesystem (server/replit_integrations/object_storage/objectStorage.ts → LocalFile/LocalBucket)
- App started via /var/www/protels/start.sh (sources .env then runs node dist/index.cjs)
- .env file at /var/www/protels/.env

**Why:** PM2 env_file didn't load vars reliably; bash wrapper with `source .env` is more reliable.

## Pending After DNS Switch
1. Update DNS A records: protels.com → 187.124.223.34, www.protels.com → 187.124.223.34
2. After DNS propagates: run `bash /root/setup_ssl.sh` on VPS to get SSL cert
3. Change root password: `passwd root` on VPS
4. Set up SSH key auth and disable password login

## Database
- Exported from Replit heliumdb via pg_dump
- Imported to protelsdb on VPS (16 tables all present)
- DB password: stored in /var/www/protels/.env

## App Status (at migration time)
- PM2: online, 0 restarts
- Port 5000: responding with correct HTML
- Nginx: active on port 80, proxying to 5000
