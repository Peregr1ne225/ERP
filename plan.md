# Docker-First Fullstack Project Plan
**Stack:** Docker, uv (Python), Django REST Framework, Bun, Next.js
**Constraint:** Zero local installations. All commands are executed via Docker.

## 1. Project Structure Setup
First, we define the base directory structure for our isolated environments.

```bash
mkdir backend frontend
```

## 2. Phase 1: Backend Setup (uv + Django DRF)

### 2.1 Backend Dockerfile (`backend/Dockerfile`)
We create a Dockerfile that uses a minimal Python image and installs `uv` directly from its official image for fast dependency management.

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Default command for development
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### 2.2 Initial `docker-compose.yml`
Create the orchestration file to mount our local code into the container. This allows us to run commands inside the container that modify our host filesystem.

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app # Mount the local backend dir into the container
    environment:
      - PYTHONUNBUFFERED=1
```

### 2.3 Initialize Django Project via Docker
Instead of installing Python locally, we spin up a temporary container to run `uv` and `django-admin`. Because of the volume mount, the generated files will appear on your host machine.

```bash
# Initialize uv project and install dependencies
docker compose run --rm backend bash -c "uv init --no-workspace && uv add django djangorestframework"

# Scaffold the Django project (named 'core')
docker compose run --rm backend uv run django-admin startproject core .
```

## 3. Phase 2: Frontend Setup (Bun + Next.js)

### 3.1 Frontend Dockerfile (`frontend/Dockerfile`)
We use the official Bun image for the frontend container.

```dockerfile
# frontend/Dockerfile
FROM oven/bun:1

WORKDIR /app

# Default command to run the Next.js development server
CMD ["bun", "run", "dev"]
```

### 3.2 Update `docker-compose.yml`
Add the frontend service. We use an anonymous volume for `node_modules` to ensure the container uses its own Linux-compiled dependencies, rather than anything that might accidentally be installed on the host.

```yaml
# docker-compose.yml (updated)
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - PYTHONUNBUFFERED=1

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules # Anonymous volume for container-specific node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true # Helps with hot-reloading on Windows/macOS file mounts
```

### 3.3 Initialize Next.js Project via Docker
We run `create-next-app` inside a temporary frontend container. We instruct it to use Bun for package management.

```bash
# Scaffold Next.js directly into the mapped volume
docker compose run --rm frontend bunx create-next-app@latest . \
  --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun
```

## 4. Phase 3: Running the Full Stack

With both projects initialized via Docker, you can start the development servers.

```bash
# Build and start both services
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

## Next Steps After Initialization
1.  **Configure CORS:** You will need to install `django-cors-headers` (via `docker compose run --rm backend uv add django-cors-headers`) and configure it in Django to allow your Next.js frontend to make API requests.
2.  **Database Integration:** Add a PostgreSQL service to your `docker-compose.yml` and connect Django to it.
