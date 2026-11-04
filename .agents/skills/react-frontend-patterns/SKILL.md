---
name: react-frontend-patterns
description: Use when building or refactoring React and TypeScript frontend components, hooks, routes, or shared UI in this Vite application.
---

# React Frontend Patterns

Keep frontend changes focused, composable, and consistent with the existing React 19 and TypeScript codebase.

## Use This Skill For

- Creating or refactoring pages and reusable components
- Designing hooks for browser-only file workflows
- Adding React Router routes
- Managing loading, error, and success states
- Improving component accessibility and keyboard behavior

## Project Patterns

- Use functional components and hooks.
- Keep tool pages in `frontend/src/pages/`.
- Reuse `ToolPageTemplate`, `FileUploadArea`, and `useFileUpload` before adding new upload flows.
- Keep shared UI in `frontend/src/components/` and shared behavior in `frontend/src/hooks/` or `frontend/src/utils/`.
- Use TypeScript interfaces for component props and avoid `any`.
- Keep browser file processing in memory; use `Blob`, `File`, object URLs, and client-side libraries.
- Revoke object URLs when they are no longer needed.
- Surface failures with the existing toast utilities and preserve loading state cleanup with `try`/`catch`/`finally`.

## Validation

Run the smallest relevant frontend checks from `frontend/`:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Do not add backend endpoints, Flask code, server-side processing, persistence, or infrastructure changes for frontend-only tools.
