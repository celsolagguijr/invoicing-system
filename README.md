# Invoicing System - Beginner Run Guide

This guide is written for beginners and shows exactly how to run the full system (backend + frontend) on your local machine.

## 1. Prerequisites

Install these first:

1. Node.js `18+` (recommended: latest LTS)
2. npm (comes with Node.js)
3. Git

Check versions:

```bash
node -v
npm -v
git --version
```

## 2. Clone The Project

```bash
git clone https://github.com/celsolagguijr/invoicing-system.git
cd invoicing-system
```

## 3. Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## 4. Configure Backend Environment

Go to backend folder:

```bash
cd ../backend
```

Create `.env` file (if not yet created):

```bash
cp .env.example .env
```

Update at least these values in `.env`:

```env
SERVER_PORT=3000
NODE_ENV=development
DATABASE_URL=./data/mydb.sqlite
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRES_IN=3600
BCRYPT_SALT_ROUND=5
LOG_LEVEL=info
```

Notes:

1. This project uses `SQLite` for local development.
2. You do not need to create a MySQL database.

## 5. Configure Frontend Environment

Go to frontend folder:

```bash
cd ../frontend
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Set the API URL to your backend port:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

If your backend uses a different port (example: `8093`), update this value:

```env
VITE_API_BASE_URL=http://localhost:8093/api
```

## 6. Port Setup (Very Important)

Use matching ports between backend and frontend:

1. Backend port is controlled by `SERVER_PORT` in `backend/.env`.
2. Frontend API target is controlled by `VITE_API_BASE_URL` in `frontend/.env`.

Example mapping:

1. Backend `SERVER_PORT=3000` -> Frontend `VITE_API_BASE_URL=http://localhost:3000/api`
2. Backend `SERVER_PORT=8093` -> Frontend `VITE_API_BASE_URL=http://localhost:8093/api`

## 7. Run Backend

From `backend` folder:

```bash
npm run dev
```

Keep this terminal open.

Expected result: backend runs on `http://localhost:3000` (or your configured `SERVER_PORT`).

## 8. Run Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Keep this terminal open too.

Expected result: frontend runs on `http://localhost:5173`.

Optional: run frontend on a different port:

```bash
npm run dev -- --port 5174
```

## 9. Open The App

In your browser, open:

```text
http://localhost:5173
```

## 10. Build Commands (Optional)

Backend build:

```bash
cd backend
npm run build
```

Frontend build:

```bash
cd frontend
npm run build
```

## 11. Common Issues

1. `npm run dev` fails in frontend:
  Ensure backend is running first and check that `.env` is configured in backend.

2. Port already in use:
  Change `SERVER_PORT` in backend `.env` and update `VITE_API_BASE_URL` in frontend `.env`, then restart both servers.

3. Token/login issues:
  Clear browser local storage and login again.

4. Database/schema errors after new fields:
  Stop backend, restart backend so TypeORM sync can update SQLite schema.

## 12. Project Structure

```text
invoicing-system/
  backend/   # API server, SQLite, PDF generation
  frontend/  # React + Vite web app
```
