# NGO Training Platform — Render Deployment Guide

## Prerequisites
- A [Render](https://render.com) account (free tier works)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- Your project pushed to a GitHub or GitLab repository

---

## Step 1 — Set Up the Neon Database

1. Log in to [neon.tech](https://neon.tech) and create a new project.
2. In the Neon dashboard, open the **SQL Editor**.
3. Copy the entire contents of `schema.sql` and run it.
4. Copy your **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   You will need this in Step 3.

---

## Step 2 — Deploy via render.yaml (Recommended)

1. Push this entire project folder to a GitHub repository.
2. In Render, click **New → Blueprint** and connect your GitHub repo.
3. Render will detect `render.yaml` and create both services automatically.
4. After the services are created, proceed to **Step 3** to set secrets.

### Alternative: Manual Setup

**Backend (Web Service):**
| Setting | Value |
|---|---|
| Name | `ngo-lms-api` |
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Health Check Path | `/health` |

**Frontend (Static Site):**
| Setting | Value |
|---|---|
| Name | `ngo-lms-client` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `./dist` |

---

## Step 3 — Set Environment Variables

### Backend service (`ngo-lms-api`):

Go to **Environment** tab in the Render dashboard and add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string (from Step 1) |
| `JWT_SECRET` | Click "Generate" — Render auto-generates a secure value |
| `FRONTEND_URL` | Your frontend's Render URL (e.g. `https://ngo-lms-client.onrender.com`) |

### Frontend service (`ngo-lms-client`):

| Key | Value |
|---|---|
| `VITE_API_URL` | Your backend's Render URL (e.g. `https://ngo-lms-api.onrender.com`) |

> **Important:** `VITE_API_URL` must be set **before** the first build runs. If you set it after, trigger a manual redeploy.

---

## Step 4 — Verify Deployment

1. Visit `https://ngo-lms-api.onrender.com/` — you should see:
   ```json
   { "status": "ok", "service": "NGO Training LMS API" }
   ```
2. Visit `https://ngo-lms-api.onrender.com/health` — you should see:
   ```json
   { "status": "healthy", "db": "connected" }
   ```
3. Visit your frontend URL — the login page should load.

---

## Step 5 — First Login

Use the seed admin account created by `schema.sql`:
- **Email:** `admin@ngo.org`
- **Password:** `Admin1234!`

**Change this password immediately after your first login.**

To create field staff accounts, use the **Register** tab on the login page. New users default to the `FieldStaff` role.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot GET /` | No root route | Fixed in `server.js` — a `GET /` health route now exists |
| `ERR_MODULE_NOT_FOUND` | Wrong build/start command | Use `rootDir: backend`, `buildCommand: npm install`, `startCommand: node server.js` |
| `CORS error` in browser | `FRONTEND_URL` not set on backend | Add `FRONTEND_URL` env var and redeploy backend |
| `502 Bad Gateway` | Backend not started yet | Wait 30s on free tier spin-up, or check `/health` |
| DB connection refused | `DATABASE_URL` missing or wrong | Verify the connection string includes `?sslmode=require` |
| Blank frontend page | `VITE_API_URL` not set at build time | Set env var, then manually trigger a new deploy |
| JWT errors after redeploy | `JWT_SECRET` changed | Use a stable secret value (do not regenerate) |

---

## Architecture Overview

```
Browser
  │
  ├─► ngo-lms-client (Render Static Site)
  │     React + Vite SPA
  │     Served as static files from /dist
  │
  └─► ngo-lms-api (Render Web Service)
        Express.js + Node.js
        │
        └─► Neon PostgreSQL (SSL)
```

## Security Checklist

- [x] JWT tokens expire after 8 hours
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] CORS restricted to `FRONTEND_URL` only
- [x] SQL uses parameterized queries (no injection)
- [x] `DATABASE_URL` and `JWT_SECRET` are never in code
- [x] SSL enforced on Neon DB connection
- [x] Token expiry handled gracefully — auto-logout on 401
- [ ] Change the default admin password on first login
- [ ] Set up a custom domain with HTTPS (Render provides this free)
