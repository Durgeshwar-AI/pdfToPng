# AGENTS.md

## Scope

This repository's agent skills are for the **React/Vite frontend** in `frontend/`.
Frontend tools must process user files in the browser with installed JavaScript
libraries. Do not create or modify backend, Flask, Docker, deployment, or server
processing code for frontend tool work.

## Frontend Architecture

- Entry point: `frontend/src/main.tsx`
- Application and routes: `frontend/src/App.tsx`
- Pages: `frontend/src/pages/`
- Shared components: `frontend/src/components/`
- Shared hooks: `frontend/src/hooks/`
- Shared data and utilities: `frontend/src/data/` and `frontend/src/utils/`
- API base URL: `VITE_API_URL` exists for legacy integrations; new browser-only tools must not depend on it.

## Hard Rules

1. Keep selected files in the browser and process them in memory.
2. Do not add backend endpoints, server-side processing, persistence, or external APIs.
3. Use only file-manipulation features such as conversion, compression, resize,
   merge, split, metadata inspection, and related browser workflows.
4. Reuse existing upload, toast, history, and page-template patterns.
5. Keep UI accessible: semantic HTML, labels, keyboard support, focus states,
   and live status updates.

## Frontend Commands

Run from `frontend/`:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Code Conventions

- TypeScript and TSX with 2-space indentation.
- Functional React components and hooks only.
- Prefer typed props and existing shared components over `any` or duplicated flows.
- Use Tailwind CSS v4 classes and existing theme utilities.
- Revoke object URLs and clean up browser resources.
- Surface processing failures with the existing toast utilities.

## Adding a Frontend Tool

1. Add the page under `frontend/src/pages/`.
2. Add the route in `frontend/src/App.tsx`.
3. Add metadata in `frontend/src/data/toolsData.tsx`.
4. Reuse `ToolPageTemplate`, `FileUploadArea`, and `useFileUpload` where applicable.
5. Update `Readme.md` with the user-facing tool documentation.
6. Run the relevant frontend validation commands.

## Available Skills (`.agents/skills/`)

| Skill | What it does |
|---|---|
| `client-file-processing` | Build browser-only PDF, image, document, and archive file workflows with no backend or external API. |
| `react-frontend-patterns` | Build and refactor typed React components, hooks, routes, and shared UI. |
| `wcag-audit-patterns` | Audit and remediate WCAG 2.2 issues in the React frontend. |
