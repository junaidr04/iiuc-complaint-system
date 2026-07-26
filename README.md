# IIUC Campus Complaint Management System

Full MERN app split into two independent projects:

- `frontend/` — React 19 + Vite + Tailwind
- `backend/` — Express + Mongoose (MongoDB Atlas) API

## Local development

Open **two terminals**.

**Terminal 1 — backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, GEMINI_API_KEY
npm run dev             # http://localhost:5000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The frontend's Vite dev server proxies every `/api/*` request to
`http://localhost:5000`, so no frontend code needed to change.

## Production build

```bash
cd backend && npm run build && npm start
cd frontend && npm run build   # outputs frontend/dist, deploy as a static site (Vercel)
```

Deploy `backend/` to Render (Node service) and `frontend/` to Vercel, same as
NeoMart. Set `CLIENT_URL` on the backend and point the frontend's API calls
at the deployed backend URL (or reuse the same proxy pattern via a rewrite
rule on Vercel).
