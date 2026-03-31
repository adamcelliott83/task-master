# CLAUDE.md — task-master

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**task-master** is a task tracking application that supports daily, weekly, and monthly task management with:
- Visual indicators for task categories
- Reminder system
- Consequences/penalties for failing to complete tasks

> Current status: **early scaffold** — only README and .gitignore exist. No source code, configuration, or tests have been written yet.

## Repository State (as of 2026-03-31)

```
task-master/
├── .git/
├── .gitignore       # Visual Studio template (implies .NET or Node.js + VS)
└── README.md        # One-line project description
```

No package manager, framework, or language has been committed yet. The `.gitignore` is a standard GitHub Visual Studio template, suggesting the stack will likely be **.NET**, **Node.js**, or a hybrid.

## Branch Conventions

- `main` — stable, production-ready code
- `claude/<description>-<id>` — branches created by AI assistants for specific tasks
- Feature work should be developed on a dedicated branch, then merged to `main` via pull request

The current active development branch is `claude/add-claude-documentation-YmPGi`.

## Development Workflow

Since the stack is not yet decided, follow these general rules once a stack is chosen:

1. **Install dependencies** before writing code (`npm install`, `dotnet restore`, etc.)
2. **Run tests** before committing — never commit code that breaks existing tests
3. **Lint before committing** — use whatever linter is configured for the project
4. **Keep commits atomic** — one logical change per commit with a clear message
5. **Never commit secrets** — `.env` and credential files are gitignored; keep it that way

## Git Commit Style

Use short, imperative commit messages:

```
Add weekly task recurrence logic
Fix reminder not firing on deadline day
Update category color tokens
```

Avoid vague messages like "fix stuff" or "WIP".

## Key Conventions to Follow

- **Do not push directly to `main`** — always use a feature/task branch and PR
- **Do not commit `.env` files** — they are explicitly gitignored
- **Do not skip linting or test steps** — even if they slow things down
- **Read existing code before modifying it** — understand context before making changes
- **Don't add speculative abstractions** — implement only what the current task requires

## When Stack/Framework Is Chosen

Update this file with:
- Language and runtime version (e.g., Node 20, .NET 9)
- Package manager (npm/yarn/pnpm/NuGet)
- Framework (React, Blazor, Next.js, etc.)
- How to install dependencies
- How to run the dev server
- How to run tests
- How to lint/format
- Folder structure conventions

## Environment Variables

Secrets and environment-specific configuration must go in a `.env` file (gitignored). A `.env.example` file should be committed to document required variables without exposing values.

## Notes for AI Assistants

- This repo is in its initial scaffold phase — there is no existing code to break
- When implementing features, ask about the intended stack before assuming one
- The README is the authoritative description of intended functionality
- Keep CLAUDE.md up to date as the project evolves
