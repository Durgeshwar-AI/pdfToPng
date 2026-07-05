# AGENTS.md

## Architecture

Full-stack app: **Flask backend** (`backend/`) + **React/Vite frontend** (`frontend/`). Not a monorepo — no workspace tooling. Each side has its own `package.json` / `requirements.txt` and runs independently.

- Backend entry: `backend/main.py` → `app/__init__.py` creates Flask app, registers blueprints
- Frontend entry: `frontend/src/main.jsx` → `App.jsx` (React Router v7)
- API base URL: `http://localhost:5000` (set via `VITE_API_URL` env var)

## Hard Rules (from CONTRIBUTING.md)

1. **No persistent storage** — server processes files in-memory only, never writes to disk/DB
2. **No external APIs** — all processing is local via installed libraries
3. **Only file-manipulation features** — format conversion, compression, resize, merge, split, etc.

Violations will not be merged.

## Dev Commands

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py             # Runs on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Runs on :5173
```

### Docker (recommended for first setup)
```bash
docker-compose up --build  # Frontend :5173, Backend :5000
```

### Lint (frontend only)
```bash
cd frontend && npm run lint
```

There are **no test suites, typecheck, or formatter commands** configured in this repo.

## Code Conventions

- **Python**: 4-space indent (PEP 8). Blueprints in `backend/blueprints/`, registered in `app/__init__.py`. Each blueprint = one file = one feature area.
- **JS/JSX**: 2-space indent. Functional components + hooks only. React 19, Vite 7, Tailwind CSS v4.
- **Line endings**: LF (enforced by `.editorconfig`)
- **Unused vars**: ESLint ignores vars matching `^[A-Z_]` (component names, constants)

## Backend Patterns

- Blueprints use a shared `validate_uploaded_file()` + `validate_image_file()` flow from `utils/validators.py`
- The `@process_image_request` decorator in `utils/decorators.py` handles upload validation, image loading, and cleanup for image endpoints
- All responses use `utils.helpers.error()` for error responses and `send_file_and_cleanup()` for file downloads
- Force `gc.collect()` after processing large files

## Frontend Patterns

- Tool pages live in `frontend/src/pages/` — one page per feature
- Shared `FileUploadArea` component and `useFileUpload` hook for upload flows
- `ToolPageTemplate` provides consistent layout for tool pages
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` — uses CSS-first config)
- PDF.js (`pdfjs-dist`) used client-side for PDF rendering; backend `/convertPng` exists but UI defaults to client-side

## Adding a New Feature

1. Create blueprint in `backend/blueprints/`, register it in `app/__init__.py`
2. Create page in `frontend/src/pages/`, add route in `App.jsx`
3. Add tool metadata in `frontend/src/data/toolsData.jsx`
4. Update `Readme.md` (required for PR acceptance per CONTRIBUTING.md)

## Available Skills (`.agents/skills/`)

| Skill | What it does in this repo |
|---|---|
| `docker-expert` | Optimize `docker-compose.yml` and Dockerfiles — multi-stage builds, image size, non-root user, health checks, dev vs prod separation |
| `python-design-patterns` | Keep Flask blueprint code clean — single responsibility per blueprint, composition over inheritance, avoid God functions in processing logic |
| `python-observability` | Add structured JSON logging and request correlation IDs to Flask endpoints; debug production file-processing failures |
| `wcag-audit-patterns` | Audit the React frontend for WCAG 2.2 violations — missing alt text, keyboard access, color contrast, form labels on upload components |

## Deployment

- **Render**: `render.yaml` at root — backend only (gunicorn, 1 worker, 120s timeout)
- **Vercel**: `frontend/vercel.json` — frontend static build
- No CI/CD workflows configured (`.github/` is empty)
