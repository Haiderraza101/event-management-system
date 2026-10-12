# Eventide — Event Management System

A React single page application for discovering live events, registering for them and
managing personal bookings. Event data comes from the Ticketmaster Discovery API.

## Tech Stack

- React 18
- Redux Toolkit
- React Router
- Vite
- Ticketmaster Discovery API v2

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Ticketmaster Consumer Key to `.env` before starting the dev server.
Keys are issued free of charge at https://developer.ticketmaster.com/.

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_TICKETMASTER_API_KEY` | Consumer Key from the Ticketmaster developer portal |

The `.env` file is ignored by git and must never be committed.
