# Kecha 2026 - Wedding RSVP App

## Overview
A full-stack wedding RSVP and guest management application for "Kecha 2026". Built in French, it allows guests to RSVP via personalized invitation links and provides an admin dashboard for managing the guest list.

## Architecture

**Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Express.js + TypeScript (tsx for dev)
- **Database:** PostgreSQL via Neon serverless (Drizzle ORM)
- **Auth:** Passport.js with local strategy + express-session
- **Email:** Resend (optional — gracefully skipped if `RESEND_API_KEY` is not set)
- **Styling:** Tailwind CSS + Radix UI components + shadcn/ui
- **Routing:** Wouter

**Project Structure:**
- `client/` — React frontend (Vite root)
- `server/` — Express backend (serves API + Vite middleware in dev)
- `shared/` — Shared types and Drizzle schema
- `drizzle.config.ts` — Drizzle ORM config

## Key Features
- Public RSVP submission form
- Personalized invitation links with unique tokens
- Admin dashboard (authentication required) for guest management
- CSV export of guest list
- Guest check-in functionality
- Email confirmation via Resend (optional)
- Rate limiting on RSVP endpoints

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Session secret (defaults to "kecha-secret-2026")
- `ADMIN_USERNAME` — Admin login username (defaults to "admin")
- `ADMIN_PASSWORD` — Admin login password (defaults to "kecha-admin-2026")
- `RESEND_API_KEY` — Resend API key for email confirmations (optional)
- `APP_URL` — Base URL for invitation links (optional)

## Development
```bash
npm run dev        # Start dev server (port 5000)
npm run db:push    # Sync database schema
npm run build      # Build for production
npm run start      # Start production server
```

## Default Admin Credentials
- Username: `admin`
- Password: `kecha-admin-2026`

## Notes
- In development, Vite runs as middleware within Express
- The server listens on `0.0.0.0:5000`
- Email sending is silently skipped if `RESEND_API_KEY` is not configured
