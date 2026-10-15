# ERP — Enterprise Resource Planning

A full-stack ERP web application designed to bring business information and workflows together in one place.

The project uses a modern web stack with a Next.js frontend, Django REST Framework backend, and PostgreSQL database. Docker Compose provides separate development and production configurations.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
| Web Server / Proxy | Nginx |
| Package Management | Bun (frontend), uv (Python backend) |

## Architecture

```text
┌──────────────────────────┐
│      Next.js Frontend    │
│       React / UI         │
└────────────┬─────────────┘
             │ HTTP / API
             ▼
┌──────────────────────────┐
│    Django REST API       │
│    Business Logic        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│       Database           │
└──────────────────────────┘
```

The application is organized into separate frontend and backend services, with PostgreSQL providing persistent data storage.

## Project Structure

```text
ERP/
├── backend/          # Django backend and REST API
├── frontend/         # Next.js frontend
├── .agents/          # Agent-related configuration
├── compose.yml       # Development environment
├── compose.prod.yml  # Production environment
├── nginx.conf        # Nginx configuration
├── plan.md           # Project planning notes
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools:

- Git
- Docker
- Docker Compose (included with Docker Desktop)

### 1. Clone the repository

```bash
git clone https://github.com/Peregr1ne225/ERP.git
cd ERP
```

### 2. Configure environment variables

Create the environment file required by the Compose configuration and populate the required database credentials and Django settings.

Keep secrets out of version control. Do not commit production credentials, secret keys, or passwords.

### 3. Start the development environment

```bash
docker compose up --build
```

### 4. Access the application

Once the services start successfully:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

The exact API routes depend on the backend URL configuration.

To stop the development environment:

```bash
docker compose down
```

## Production Deployment

The repository includes a separate production Compose configuration.

```bash
docker compose -f compose.prod.yml up --build -d
```

Before deploying, configure production environment variables, verify database persistence and Django security settings, and ensure the reverse proxy, static files, and public ports match your deployment environment.

Do not expose the database publicly.

## Development Workflow

The project separates the frontend, backend, and database into individual services. This makes it easier to develop and maintain each layer independently while using Docker to keep the runtime environments consistent.

## Roadmap

The following areas can be documented as features are implemented and verified:

- [ ] Document core ERP modules and business workflows
- [ ] Document API endpoints and authentication
- [ ] Add screenshots of the application
- [ ] Add automated testing instructions
- [ ] Document production deployment and backups

## License

No license has been specified in this README. Add a license that reflects how you intend the project to be used and distributed.
