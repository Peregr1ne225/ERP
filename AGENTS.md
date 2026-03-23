# Agent Instructions (AGENTS.md)

Welcome to the ERP project. This document outlines the build/lint/test commands, code style guidelines, and conventions for AI coding agents operating in this repository. It serves as the primary system prompt for autonomous coding assistants, ensuring consistency, reliability, and code quality.

## 1. Project Architecture and Stack

This is a modern web application consisting of a decoupled backend and frontend. Agents must respect this separation of concerns.

### Project Structure (ERP System)
```text
ERP/
├── backend/
│   ├── apps/
│   │   ├── inventory/   # Handles DropsdownList, Product, PriceHistory, Ledgers
│   │   ├── kpi/         # Mktg & E-com analytics (Campaigns, Ads, Conversions)
│   │   └── project/     # HR & PM system (Employee, AttendanceLog, Project, Task)
│   ├── config/          # Core settings, WSGI, ASGI, and root urls.py
│   └── manage.py
├── frontend/            # Next.js 16.2.0 UI (React 19, TypeScript, Tailwind)
├── compose.yml          # Docker composition orchestrating the entire stack
└── AGENTS.md            # This instruction file
```

### Backend
- **Framework**: Django, Django Rest Framework (DRF)
- **Language**: Python 3.12
- **Package Manager**: UV
- **Database**: PostgreSQL

### Frontend
- **Framework**: Next.js 16.2.0, React 19
- **Language**: TypeScript
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4

---

## 2. Build, Lint, and Test Commands

All commands should be executed via Docker to ensure parity with the containerized environment. Ensure the stack is running first using `docker compose up --build -d`.

### Docker Stack Management
- **Start the stack**: `docker compose up --build -d`
- **Stop the stack**: `docker compose down`
- **Restart a service**: `docker compose restart backend` (useful if you modify configuration files or install new packages and they aren't immediately recognized)
- **View logs**: `docker compose logs -f`
- **View specific logs**: `docker compose logs -f backend`

### Backend Commands (run via Docker)
- **Install Dependencies**: `docker compose exec backend uv sync`
- **Database Migrations**: `docker compose exec backend uv run python manage.py migrate`
- **Make Migrations**: `docker compose exec backend uv run python manage.py makemigrations`
- **Create Superuser**: `docker compose exec backend uv run python manage.py createsuperuser`
- **Linting**: We recommend using Ruff. Run `docker compose exec backend uv run ruff check .`
- **Formatting**: `docker compose exec backend uv run ruff format .`
- **Type Checking**: We use `mypy` with `django-stubs` and `djangorestframework-stubs`. Run `docker compose exec backend uv run mypy . --explicit-package-bases`
- **Run All Tests**: `docker compose exec backend uv run python manage.py test`
- **Run a Single Test**: 
  - To test a specific class: `docker compose exec backend uv run python manage.py test path.to.app.tests.test_module.TestClass`
  - To test a specific method: `docker compose exec backend uv run python manage.py test path.to.app.tests.test_module.TestClass.test_method`

### Frontend Commands (run via Docker)
- **Install Dependencies**: `docker compose exec frontend bun install`
- **Build Production**: `docker compose exec frontend bun run build`
- **Linting**: `docker compose exec frontend bun run lint`
- **Run All Tests**: `docker compose exec frontend bun test`
- **Run a Single Test**: `docker compose exec frontend bun test path/to/test/file.test.ts`
- **Run Test in Watch Mode**: `docker compose exec frontend bun test --watch path/to/test/file.test.ts`

---

## 3. Code Style Guidelines

### A. General Principles
- **Readability**: Code should be self-documenting. Use highly descriptive variable and function names. Avoid single-letter variables except in standard loops (e.g., `i`, `j`).
- **Modularity**: Break down complex logic into smaller, testable, and reusable functions or components. Single Responsibility Principle (SRP) applies strictly.
- **Immutability**: Prefer immutable data structures where possible, especially in React state and when manipulating arrays/objects in TypeScript.
- **Comments**: Focus exclusively on *why* the code is written a certain way, not *what* it is doing, unless the algorithm is highly obscure or involves complex mathematical formulas.

### B. Imports
- **Python**: Sort imports using `isort` or `ruff`.
  1. Standard library imports
  2. Third-party imports (Django, DRF, etc.)
  3. Local application imports
- **TypeScript/React**: 
  1. Built-in Node.js modules
  2. External dependencies (`react`, `next`, etc.)
  3. Internal paths (`@/components`, `@/hooks`)
  4. Relative paths and styles

### C. Formatting & Naming Conventions
- **Python**:
  - Variables and Functions: `snake_case`
  - Classes and Exceptions: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Follow PEP 8 guidelines. Maximum line length is 88 (Ruff default).
- **TypeScript/JavaScript**:
  - Variables and Functions: `camelCase`
  - React Components and Interfaces/Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Filenames for Components: `PascalCase.tsx` (e.g., `Button.tsx`)
  - Filenames for Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
  - Follow Prettier configurations. Avoid manually tweaking spacing.

### D. Typing
- **Python**: Use type hints extensively (e.g., `def get_user(user_id: int) -> User:`). This aids IDE autocomplete and static analysis tools.
- **TypeScript**: Use strict typing. Avoid `any` at all costs. Prefer `unknown` if the type is truly dynamic. Create clear `interface` or `type` definitions for all data structures, API responses, and React component props. 

### E. Error Handling
- **Backend (Django/DRF)**:
  - Use `try/except` blocks for operations that might fail (e.g., database queries, external API calls, file operations).
  - Raise explicit exceptions (e.g., `ValidationError`, `NotFound`) and let DRF's exception handler convert them to appropriate HTTP responses (400, 404, etc.).
  - Log errors with rich context (user ID, request path) for debugging.
- **Frontend (Next.js/React)**:
  - Use `try/catch` in async functions.
  - Implement React Error Boundaries to catch render phase errors and prevent the whole application from crashing.
  - Show user-friendly error messages (e.g., using toast notifications) without exposing raw technical details, stack traces, or internal IP addresses to the end-user.

### F. Security
- Never hardcode secrets, API keys, or passwords. Always use environment variables (`.env`).
- For Next.js, ensure public variables are prefixed with `NEXT_PUBLIC_` only when absolutely necessary to expose them to the browser.
- Validate all user input on the backend using DRF serializers. Trust no client input.
- Protect against SQL Injection (use Django ORM appropriately) and XSS (React handles this automatically, but be extremely careful with `dangerouslySetInnerHTML`).

### H. Business Logic & Conventions
- **Django Signals**: Business logic such as calculating total inventory stock is handled via Django signals (e.g., `post_save`). Avoid writing raw SQL or overriding `save()` methods unless necessary; use signals to keep models decoupled and automate recalculations based on ledger entries.
- **Calculated Properties**: Use the `@property` decorator on Django models for complex calculations (e.g., task completion percentage, lateness). 
- **Read-Only API Fields**: Fields that are automated or calculated via `@property` MUST be explicitly added to serializers with `read_only=True` (e.g., `percent = serializers.FloatField(read_only=True)`).
- **Filtering Computed Properties**: When creating custom DRF `@action` endpoints that filter based on a `@property` (which cannot be queried directly via the ORM), execute the logic in Python on the `get_queryset()` list (e.g., `[task for task in tasks if task.is_late]`), balancing logic parity against dataset size.
- **Foreign Keys in __str__**: When defining string representation `__str__` for models with ForeignKeys, prefer using the `_id` suffix (e.g., `self.sku_id` instead of `self.sku.sku_id`) to avoid N+1 queries when evaluating string representations. Type checkers might need configuration or ignores for dynamic `_id` fields, but performance is prioritized.
- **Authentication**: Endpoints modifying state (POST/PUT/PATCH/DELETE) should generally be secured. By default, DRF is configured with `IsAuthenticatedOrReadOnly`. When creating new ViewSets, if you intend to bypass this, explicitly set `permission_classes = [permissions.AllowAny]`.

### I. Code Review Checklist for Agents
- Are there tests for this logic?
- Are imports properly ordered?
- Have type hints/TypeScript interfaces been fully provided?
- Does this change introduce any potential memory leaks (e.g., un-cleared event listeners in React)?
- Has the component been built with accessibility (a11y) in mind (e.g., aria-labels)?

---

## 4. Agent-Specific Rules and Instructions

The following rules apply specifically to AI coding agents, including Cursor and Copilot. These supersede any default agent behaviors.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

### Additional Agent Directives:
- **Zero-Hallucination Policy**: If you are unsure of the correct import path or framework syntax, use your local search tools (`glob`, `grep`, `read`) to inspect the codebase BEFORE writing code. Do not guess.
- **Environment Verification**: Always check the environment configuration (e.g., `compose.yml`, `Dockerfile.dev`, `.env`) before suggesting library installations.
- **Structural Mimicry**: When generating new files, strictly follow the exact structural patterns established in neighboring files within the project.
- **Non-Destructive Edits**: Prioritize non-destructive edits and always verify the correctness of the code (via test commands) before finalizing your task. 
- **Git Practices**: When creating a pull request or a commit, ensure your message focuses on the "why" and conforms to standard Git semantic message practices (e.g., `feat:`, `fix:`, `chore:`).
