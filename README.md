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

## 5. Run Backend

From `backend` folder:

```bash
npm run dev
```

Keep this terminal open.

Expected result: backend runs on `http://localhost:3000` (or your configured `SERVER_PORT`).

## 6. Run Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Keep this terminal open too.

Expected result: frontend runs on `http://localhost:5173`.

## 7. Open The App

In your browser, open:

```text
http://localhost:5173
```

## 8. Build Commands (Optional)

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

## 9. Common Issues

1. `npm run dev` fails in frontend:
  Ensure backend is running first and check that `.env` is configured in backend.

2. Port already in use:
  Change `SERVER_PORT` in backend `.env`, then restart backend.

3. Token/login issues:
  Clear browser local storage and login again.

4. Database/schema errors after new fields:
  Stop backend, restart backend so TypeORM sync can update SQLite schema.

## 10. Project Structure

```text
invoicing-system/
  backend/   # API server, SQLite, PDF generation
  frontend/  # React + Vite web app
```
