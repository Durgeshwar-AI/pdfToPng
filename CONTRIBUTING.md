# Contributing to pdfToPng

Thank you for considering a contribution! This project is focused on **local file manipulation** via a small Flask + React stack.

To keep the project simple, safe, and privacy‑friendly, all contributions **must** follow these rules.

## Core Rules

1. **No data may be stored in the backend.**

   - The server may only process files in memory for the duration of a request.
   - Do **not** write user files or metadata to disk, databases, caches, object storage, or logs.

2. **No external APIs.**

   - Do not call third‑party web APIs, SaaS products, or remote microservices.
   - All processing must be implemented locally using libraries installed in this project.

3. **Only file‑manipulation features.**
   - New features must be strictly related to local file manipulation: e.g., format conversion, compression, resizing, cropping, merging, splitting, optimizing, etc.
   - Features unrelated to file manipulation (authentication, user profiles, analytics dashboards, etc.) are out of scope.

If a pull request violates any of these rules, it will not be merged.

## How to Contribute

1. **Fork** the repository and create a new branch for your change.
2. **Set up** the project locally (see `README.md` for detailed steps).
3. **Implement** your change, keeping the rules above in mind.
4. **Add or update documentation** in `README.md` if you introduce a new feature.
5. **Run the app** (backend and frontend) to ensure everything works.
6. **Open a Pull Request** with a clear description:
   - What feature or bugfix you are adding
   - How it works
   - Any limitations or follow‑up ideas

## Code Style & Guidelines

- **Backend (Python / Flask)**

  - Keep handlers small and focused on one responsibility.
  - Do all processing in memory; avoid temporary files unless absolutely required, and never keep them after the request.
  - Validate inputs and return clear error messages.

- **Frontend (React / Vite)**
  - Prefer functional components and hooks.
  - Keep UI simple and focused on file manipulation flows.
  - Clearly surface any constraints (e.g., max file size) to the user.

## Adding New Features

When proposing a new feature, please verify:

- It is clearly a **file manipulation** operation.
- It can be implemented purely **locally** without external web services.
- It does **not** require storing user data or files on the server.

Examples of acceptable features:

- PDF page range to PNG/JPEG conversion
- Image resizing, rotation, compression
- Merging multiple PDFs
- Splitting a PDF into multiple files
- Converting between common image formats

If you are unsure whether a feature idea fits the rules, open an issue to discuss it before implementing.

Thank you again for helping improve this project!
