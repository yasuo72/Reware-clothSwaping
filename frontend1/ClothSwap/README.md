# ClothSwap Monorepo

This repository contains both the **Express + Vite** API / web server and the **React** client for the ClothSwap project.

## Prerequisites

* Node.js `>= 20`
* A running PostgreSQL database (or Neon) that you can point to via `DATABASE_URL`.

## Quick Start

1. **Clone & Install**

   ```bash
   # from the project root
   npm install
   ```

2. **Environment Variables**

   Copy the example file and fill in the values that make sense for your environment:

   ```bash
   cp .env.example .env
   # edit .env with your DB connection string and a random SESSION_SECRET
   ```

3. **Database Migration** (optional – only needed the first time)

   ```bash
   npm run db:push
   ```

4. **Run in Development**

   ```bash
   npm run dev
   ```

   This starts **both** the API and the Vite dev-server on the port defined in `.env` (default `5000`).

5. **Production Build**

   ```bash
   npm run build  # bundles client + server to ./dist
   npm start      # runs the compiled server
   ```

## Folder Structure

```
ClothSwap/
├── client/      # React SPA source code (Vite)
├── server/      # Express + Drizzle ORM API
├── shared/      # Shared TypeScript types & Drizzle schemas
└── …
```

## Troubleshooting

* **`Error: DATABASE_URL must be set`** – Make sure your `.env` has a valid Postgres connection string.
* **`Environment variable REPLIT_DOMAINS not provided`** – Set `REPLIT_DOMAINS=localhost` in your `.env` when running locally.

Feel free to reach out if you run into any issues!
