# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

# Install system dependencies (including LibreOffice)
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    libreoffice \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-impress \
    fonts-dejavu \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Expose port
EXPOSE 5000

# Command to run the application
#
# A single sync worker fully blocks on every request for its entire duration,
# so a large PDF conversion stalls all other traffic (including health checks)
# until it finishes. gthread workers with multiple threads let the OS
# context-switch between in-flight requests instead of serializing them,
# and PyMuPDF/python-docx release the GIL during their C-level page/render
# work, so concurrent requests actually make progress instead of queuing.
CMD gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 4 --worker-class gthread --timeout 120 main:app