## PDF to PNG & Image Tools

This project is a small full‑stack web app for doing simple, local file manipulations:

- Convert PDF (first page) to PNG
- Convert images to WebP
- Remove the background from images

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

All endpoints:

- Process the file in memory
- Do **not** persist any data on the server

### 3. Frontend setup

From the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

By default, Vite will start the frontend at `http://localhost:5173`.

Make sure your frontend API calls target `http://localhost:5000` for the backend.

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
