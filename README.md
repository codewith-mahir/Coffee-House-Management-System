# Coffee House Management System (MERN + TypeScript)

Monorepo with server (Express + TS) and client (Vite React + TS).

## Dev
- Server
  - Env: `server/.env` (example in `.env.example`)
  - Commands:
    - `npm run dev` (hot reload)
    - `npm run build` -> `npm start`
- Client
  - Env: `client/.env` (example in `.env.example`)
  - Commands:
    - `npm run dev` (Vite)
    - `npm run build` -> `npm run preview`

## URLs
- Client: http://localhost:5173
- API: http://localhost:5000
- Health: GET http://localhost:5000/api/health

## Notes
- Set `SKIP_DB=true` in `server/.env` if MongoDB isn’t running yet.
- CORS is restricted to `CLIENT_URL`.

## Feature Roadmap (suggested)
1. Auth (signup/login, JWT, roles)
2. Menu & Categories CRUD
3. Inventory Management
4. POS Orders (cart, taxes, discounts)
5. Table/Reservation Management
6. Payment Integration (sandbox)
7. Order KDS (barista screen)
8. Sales Reports & Dashboard
9. Customer Loyalty (points)
10. Notifications & Admin Settings
