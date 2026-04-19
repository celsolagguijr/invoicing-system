# Frontend - Quick Start

This is the React + Vite frontend of the invoicing system.

## Prerequisites

1. Node.js 18+
2. npm

## Install

```bash
npm install
```

## Environment Setup (.env)

Create your frontend env file:

```bash
cp .env.example .env
```

Set these values in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

Important:

1. `VITE_API_BASE_URL` must match your backend port.
2. If backend runs on `8093`, set `VITE_API_BASE_URL=http://localhost:8093/api`.

## Run Development Server

```bash
npm run dev
```

By default, frontend runs on:

```text
http://localhost:5173
```

To run frontend on a custom port:

```bash
npm run dev -- --port 5174
```

Port mapping reference:

1. Backend port: `backend/.env` -> `SERVER_PORT`
2. Frontend API target: `frontend/.env` -> `VITE_API_BASE_URL`

## Build

```bash
npm run build
```

## Important

Start backend first (`../backend`) so frontend API calls work correctly.

For full beginner step-by-step instructions, see the root guide:

- [../README.md](../README.md)
