---
name: client-file-processing
description: Use when implementing browser-only PDF, image, document, or archive conversion and file manipulation without a backend or external API.
---

# Client-Side File Processing

Implement file tools entirely in the browser so selected files remain on the user's device.

## Core Rules

- Accept files through the existing upload components and validate type and size before processing.
- Process data in memory with browser APIs and installed frontend libraries.
- Do not add fetch calls to backend endpoints for browser-only tools.
- Do not write uploaded content to disk, a database, analytics service, or external API.
- Return results as `Blob` objects or downloadable object URLs.
- Revoke object URLs after downloads or when components unmount.
- Keep progress, cancellation, and errors visible to the user.

## Implementation Guidance

- Prefer existing utilities and page patterns over new abstractions.
- Use `ArrayBuffer`, `Blob`, `URL.createObjectURL`, and `FileReader` where appropriate.
- Use PDF.js for PDF rendering and the existing PDF/image libraries for transformations.
- Preserve source files unless the user explicitly requests replacement.
- Handle empty files, invalid formats, large inputs, and multi-file naming deterministically.
- Keep expensive work asynchronous so the UI remains responsive.

## Validation

Verify the changed flow with the relevant frontend tests, then run:

```bash
npm run lint
npm run typecheck
npm run build
```

No backend code, endpoint, deployment configuration, or server dependency is required for this skill.
