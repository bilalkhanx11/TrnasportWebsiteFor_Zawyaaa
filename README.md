# Zawaya Alkayan — Transportation & Haulage Platform

Professional operations platform for Zawaya Alkayan General Contracting — Transportation & Haulage Services.

## Quick Start

### 1. Install dependencies

```bash
cd "zawaya-platform"
npm install
npm install --workspace=backend
npm install --workspace=frontend
```

### 2. Configure backend environment

The backend `.env` file is already created from `.env.example`. Change `JWT_SECRET` before deploying to production.

### 3. Start development servers

Open **two terminals**:

**Terminal 1 — Backend (port 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@zawayaalkayan.com | Admin@2026 |
| Operations Manager | manager@zawayaalkayan.com | Manager@2026 |

---

## Application Routes

| URL | Description |
|-----|-------------|
| `/` | Public company website |
| `/login` | Admin login |
| `/dashboard` | Operations overview |
| `/dashboard/tracking` | Live truck map |
| `/dashboard/trips` | Trip management |
| `/dashboard/trips/:id` | Trip detail + driver link |
| `/dashboard/drivers` | Driver management |
| `/dashboard/fleet` | Fleet/truck management |
| `/dashboard/clients` | Client management |
| `/dashboard/reports` | Reports + CSV export |
| `/dashboard/audit` | Audit logs |
| `/driver/trip/:token` | Driver mobile trip page (no login) |

---

## Key Features

- Animated public website with all company sections
- Secure JWT authentication with role-based access
- Driver management with CRUD
- Fleet management with status tracking
- Trip management with 7-step creation wizard
- Private driver trip links (cryptographically random tokens)
- Mobile GPS location update (browser geolocation)
- Live tracking map with Leaflet + OpenStreetMap
- Auto-refresh every 20 seconds
- Trip timeline and event history
- WhatsApp link sharing
- Reports with CSV export
- Audit logs
- Notification center

---

## Architecture

```
zawaya-platform/
├── backend/          Express API (port 3001)
│   └── src/
│       ├── data/db.js        In-memory JSON store (replace with PostgreSQL)
│       ├── middleware/auth.js JWT auth
│       └── routes/           REST API routes
└── frontend/         React + Vite (port 5173)
    └── src/
        ├── pages/public/     Public website
        ├── pages/dashboard/  Admin pages
        ├── pages/driver/     Driver mobile page
        ├── components/       Shared UI
        └── lib/api.js        Axios client
```

---

## Production Notes

- Replace the in-memory JSON store in `backend/src/data/db.js` with PostgreSQL + Prisma ORM
- Set a strong `JWT_SECRET` in production
- Deploy frontend to Vercel/Netlify; backend to Railway/Render/AWS
- Enable HTTPS — required for browser GPS geolocation
- For reliable background GPS tracking, a native mobile app is recommended as a future upgrade
