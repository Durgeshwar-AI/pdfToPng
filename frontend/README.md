# pdfToPng

A local file manipulation web app built with **React + Vite** on the frontend and **Flask** on the backend.

This project focuses on simple, privacy-friendly file tools that run locally through the app backend without storing user files or using external APIs.

## Features

- PDF to PNG conversion
- Image to WebP conversion
- Image to JPG conversion
- Image to Grayscale conversion
- Background removal
- Image compression
- Image rotate and flip

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Flask, Pillow
- **Other:** Flask-CORS

## Project Rules

- No user files are stored in the backend
- No external APIs are used
- All features are limited to local file manipulation

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pdfToPng.git
cd pdfToPng
```

### 2. Setup backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend runs on:

```text
http://127.0.0.1:5000
```

### 3. Setup frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Create a local `.env` file inside `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:5000
```

The frontend runs on:

```text
http://127.0.0.1:5173
```

## How to Use

1. Start the backend server.
2. Start the frontend development server.
3. Open the app in the browser.
4. Choose a tool from the sidebar.
5. Upload a file.
6. Run the conversion or processing action.
7. Download the processed file.

## Grayscale Conversion

The **Image to Grayscale** tool allows users to upload an image and download a grayscale PNG version of it.

### Supported flow

1. Select the **Image to Grayscale** tool from the sidebar.
2. Upload an image file.
3. Click **Convert to Grayscale**.
4. Download the generated grayscale image.

## Contribution Notes

Contributions should follow the rules in `CONTRIBUTING.md`:
- keep processing local,
- avoid storing user data,
- do not use external APIs,
- update documentation when adding features.

## License

This project is open source and available under the repository license.