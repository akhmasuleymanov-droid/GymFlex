GymFlex — Full demo package (frontend + backend scaffold)
======================================================

What is inside:
- frontend/ : static SPA demo (index.html) with Leaflet map and client UI (already functional)
- backend/  : Node.js + Express scaffold (server.js) using file-based db.json for demo persistence

Quick start (local)
-------------------
You need Node.js (v18+ recommended).

1) Run backend:
   cd backend
   npm install
   npm run start
   # backend listens on http://localhost:4000

2) Run frontend:
   cd frontend
   # the frontend is static HTML/JS - you can open index.html in browser directly,
   # but for full map functionality open via simple server:
   python -m http.server 5173
   # and open http://localhost:5173 in browser

Connecting frontend to backend
------------------------------
- By default the frontend demo is standalone (no API calls).
- To connect to the backend replace any client API URLs in frontend/app.js with your backend URL (e.g. https://your-backend.onrender.com).
- For demo purposes you can run backend locally and the frontend via http.server.

Deploying online (recommended)
------------------------------
Frontend: Vercel (static site)
1. Create a GitHub repo or drag & drop the 'frontend' folder to Vercel dashboard.
2. Deploy; Vercel will publish a URL like https://gymflex-frontend.vercel.app

Backend: Render (Node.js service)
1. Create a GitHub repo with the backend folder and connect it to Render.
2. Set start command: `npm start`
3. The service will provide an URL like https://gymflex-backend.onrender.com
4. Update frontend app.js to point API calls to that backend URL.

Alternative DB: Supabase / PostgreSQL
------------------------------------
For production replace file-based db.json with Postgres and store secrets in env vars.

Notes
-----
- This package is a demo scaffold ready for local testing and quick deployment.
- Do NOT use file-based db.json for production.
- After deploying the backend, you can call POST /api/setup-admin to create admin with chosen password.
