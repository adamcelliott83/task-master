# Task Master

A Progressive Web Application for tracking daily, weekly, and monthly tasks — with time-chunk scheduling, completion tracking, consequence enforcement, multi-user access, and Notion import.

## Tech Stack

All libraries are free and open-source (MIT or Apache-2.0):

| Library | License | Purpose |
|---|---|---|
| Next.js 14 | MIT | Full-stack React framework (App Router) |
| React 19 | MIT | UI rendering |
| TypeScript | Apache-2.0 | Type safety |
| Prisma | Apache-2.0 | ORM + migrations |
| PostgreSQL | PostgreSQL License | Database |
| NextAuth.js v5 | ISC | Authentication |
| Tailwind CSS | MIT | Styling |
| Radix UI | MIT | Accessible UI primitives |
| Zod | MIT | Schema validation (spec-driven) |
| bcryptjs | MIT | Password hashing |
| react-hook-form | MIT | Form state management |
| lucide-react | ISC | Icons |
| next-pwa | MIT | PWA / service worker |
| Jest | MIT | Unit testing |
| React Testing Library | MIT | Component testing |

No paid APIs required. Notion import uses file upload (CSV export), not the Notion API.

## Features

- **Daily / Weekly / Monthly tasks** with recurrence rules
- **Time chunks** — group tasks into named time blocks (e.g. "Morning Focus 9–12") instead of strict time slots
- **Progress tracking** — completion percentage ring and bar per chunk and overall
- **Consequences** — optional per-task consequence with LOW / MEDIUM / HIGH severity shown when a task is failed or overdue
- **Task creation wizard** — multi-step guided flow: type → details → recurrence → time chunk → consequence
- **Notion import** — upload a CSV exported from Notion; tasks are parsed and bulk-created
- **Multi-user** — each user sees only their own data; JWT sessions

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env and set DATABASE_URL and AUTH_SECRET

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for JWT signing (min 32 chars) |
| `AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |

### Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Prisma Studio GUI
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register pages
│   ├── (dashboard)/      # Protected app pages
│   └── api/              # API routes
│       ├── auth/         # NextAuth + register
│       ├── tasks/        # Tasks CRUD, stats, complete
│       ├── time-chunks/  # Time chunk management
│       ├── task-groups/  # Task group management
│       └── import/       # Notion CSV import
├── components/
│   ├── layout/           # Sidebar, MobileNav
│   ├── tasks/            # TaskCard, TimeChunkBlock, ProgressRing
│   ├── wizard/           # Multi-step task creation wizard
│   └── ui/               # Base UI primitives
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client singleton
│   ├── notion-parser.ts  # CSV parsing logic
│   ├── api-helpers.ts    # Auth guards, error helpers
│   └── utils.ts          # Shared utilities
└── schemas/              # Zod validation schemas (source of truth)
    ├── auth.ts
    ├── task.ts
    ├── time-chunk.ts
    ├── task-group.ts
    └── notion-import.ts
__tests__/                # Jest unit tests (TDD)
prisma/
└── schema.prisma         # Database schema
```

## Development Approach

- **Test-Driven Development (TDD)**: Tests are written to define expected behaviour before or alongside implementation. Run `npm test` at any time.
- **Spec-Driven Development**: Zod schemas in `src/schemas/` are the single source of truth for all data shapes — used by API routes, forms, and tests alike.

---

## Deploying to AWS Amplify

This repo includes an `amplify.yml` build spec. Amplify handles Next.js SSR hosting; you just need a PostgreSQL database.

### Step 1 — Create a free PostgreSQL database (Neon)

1. Go to **[neon.tech](https://neon.tech)** and sign up (free tier, no credit card)
2. Create a new project — name it `taskmaster`
3. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/taskmaster?sslmode=require
   ```

> **Alternatives:** Supabase (supabase.com) also has a free PostgreSQL tier. AWS RDS costs ~$15/month but stays in the AWS ecosystem.

### Step 2 — Push the schema to your database

Run this once from your local machine (with the Neon connection string in your `.env`):

```bash
npm run db:push
```

### Step 3 — Connect Amplify to GitHub

1. Open the **AWS Amplify console** → click **"Create new app"**
2. Choose **"From Git"** → connect your GitHub account
3. Select repository `adamcelliott83/task-master`
4. Set branch to `claude/task-master-pwa-Zm1bH`
5. Amplify will auto-detect the `amplify.yml` — no manual build settings needed

### Step 4 — Set environment variables

In Amplify console → **App settings → Environment variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string (with `?sslmode=require`) |
| `AUTH_SECRET` | Any random string, 32+ characters — generate with `openssl rand -base64 32` |
| `AUTH_URL` | `https://<your-branch>.<your-app-id>.amplifyapp.com` (shown after first deploy) |

> **Note:** `AUTH_URL` can be updated after the first deploy once you know your Amplify domain.

### Step 5 — Deploy

Click **"Save and deploy"**. Amplify will:
1. Run `npm ci` and `npx prisma generate`
2. Run `npm run build`
3. Deploy to a live HTTPS URL like `https://main.d1abc123.amplifyapp.com`

Your app is now live. Install it as a PWA from Chrome/Safari using the browser's "Add to Home Screen" option.

### Custom domain (optional)

In Amplify console → **Domain management** → add your own domain. Amplify provisions an SSL certificate automatically via AWS Certificate Manager.
