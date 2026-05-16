## PDF to PNG & Image Tools

This project is a small full‑stack web app for doing simple, local file manipulations:

- Convert PDF (first page) to PNG
- Convert images to WebP
- Remove the background from images
- Convert images to JPG

The backend is a Flask API and the frontend is a React app (Vite).

### Project Rules

These rules define how this project must be implemented and extended:

1. **No data can be stored in the backend.**  
   The server must only process files in memory for the current request and immediately return the result. No files or metadata may be written to disk, databases, or any external storage.

2. **No external API usage.**  
   All functionality must be implemented locally using libraries in this repository. Do not call third‑party web APIs or hosted services.

3. **Only file‑manipulation features.**  
   New features are welcome as long as they are related to local file manipulation (e.g., format conversion, compression, resizing, merging, splitting, optimizing) and obey Rules 1 and 2.

If you contribute to this repository, you must respect all the rules above.

---

## Tech Stack

- **Backend:** Python, Flask, Flask‑CORS, PyMuPDF (`fitz`), Pillow, `rembg`
- **Frontend:** React, React Router, Vite

---

## Project Structure

```
pdfToPng/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   └── __init__.py
│   ├── blueprints/
│   │   ├── __init__.py
│   │   ├── image.py
│   │   ├── pdf.py
│   │   └── removebg.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── README.md
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── components/
│       │   ├── Layout/
│       │   │   └── Layout.jsx
│       │   └── Sidebar/
│       │       └── Sidebar.jsx
│       └── pages/
│           ├── PdfPng.jsx
│           ├── ImageWbp.jsx
│           ├── ImageJpg.jsx
│           └── RemoveBg.jsx
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

### Folder Descriptions

**Backend** (`backend/`)

- `main.py` – Entry point for the Flask server; initializes the app and registers blueprints
- `requirements.txt` – Python dependencies for the backend
- `app/` – Flask app configuration and initialization
- `blueprints/` – Modular route handlers for each feature:
  - `pdf.py` – PDF to PNG conversion endpoint
  - `image.py` – Image format conversions (WebP, JPG)
  - `removebg.py` – Background removal endpoint
- `utils/` – Helper functions and utilities used across blueprints

**Frontend** (`frontend/`)

- `package.json` – Node.js dependencies and scripts
- `vite.config.js` – Vite bundler configuration
- `eslint.config.js` – ESLint linting rules
- `index.html` – HTML entry point
- `src/` – React source code:
  - `main.jsx` – React app entry point
  - `App.jsx` – Root React component
  - `components/` – Reusable UI components:
    - `Layout/` – Main page layout wrapper
    - `Sidebar/` – Navigation sidebar
  - `pages/` – Page components for each feature:
    - `PdfPng.jsx` – PDF to PNG converter page
    - `ImageWbp.jsx` – Image to WebP converter page
    - `ImageJpg.jsx` – Image to JPG converter page
    - `RemoveBg.jsx` – Background removal page
- `public/` – Static assets

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Durgeshwar-AI/pdfToPng.git
cd pdfToPng
```

### 2. Backend setup

From the `backend` folder:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python main.py
```

The Flask server will run at `http://localhost:5000`.

Available endpoints:

- `POST /convertPng` – Convert first page of a PDF to PNG
- `POST /convertWebP` – Convert an image to WebP
- `POST /removeBg` – Remove the background from an image
- `POST /convertJpeg` – Convert an image to JPG

All endpoints:

- Process the file in memory
- Do **not** persist any data on the server

Note: The frontend includes an "Image to JPG" tool that posts image files to `/convertJpeg` to produce a JPG download. As with all endpoints, conversions are performed in memory and no files are written to disk.

### 3. Frontend setup

From the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

By default, Vite will start the frontend at `http://localhost:5173`.

Make sure your frontend API calls target `http://localhost:5000` for the backend.

## Running with Docker (Recommended)

The easiest way to get started is using Docker and Docker Compose. This ensures all dependencies (including system tools like `poppler-utils`) are correctly installed.

### 1. Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Run the application
From the root directory, run:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 3. Development Workflow
The `docker-compose.yml` is configured for development:
- **Hot Reloading**: Changes in `backend/` or `frontend/` will automatically reload the application.
- **Persistent Models**: The `rembg` AI models are stored in a Docker volume called `rembg_models` to avoid re-downloading on every restart.

---

## Contributing

Contributions are welcome! Before opening an issue or pull request, please read `CONTRIBUTING.md`.

Key points:

- Do not add any persistent storage (files, DB, cloud storage, etc.).
- Do not integrate external web APIs or online services.
- New features should be strictly about local file manipulation.

---

## License

This project is open‑sourced under the MIT License. See `LICENSE` for details.
