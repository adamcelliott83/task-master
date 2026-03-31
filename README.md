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
