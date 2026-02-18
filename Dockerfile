# ============================================
# CareerSage - Production Dockerfile
# Multi-stage build for optimized image size
# ============================================

# ---------- Stage 1: Build Dependencies ----------
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ---------- Stage 2: Production Image ----------
FROM python:3.11-slim AS production

# Security: create non-root user
RUN groupadd -r careersage && useradd -r -g careersage -d /app -s /sbin/nologin careersage

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set ownership
RUN chown -R careersage:careersage /app

# Switch to non-root user
USER careersage

WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Environment defaults
ENV FLASK_ENV=production \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')" || exit 1

# Production server with eventlet for SocketIO support
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "1", \
     "--threads", "4", \
     "--timeout", "120", \
     "--keep-alive", "65", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "run:app"]
