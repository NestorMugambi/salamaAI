FROM python:3.12-bookworm

# Set working directory
WORKDIR /app

# Install curl (required for uv installer)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Download and install uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure uv binary is on PATH
ENV PATH="/root/.local/bin/:$PATH"

# Increase timeout for large packages
ENV UV_HTTP_TIMEOUT=120

# Copy only dependency files first (leverages caching)
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

# Add virtualenv to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY . .

# Expose FastAPI port
EXPOSE 8000



# Run the application
CMD ["sh", "-c", "/app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app & python /app/watcher.py & wait"]