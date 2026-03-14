# Makooka — Small Business Booking System

A multi-tenant web-based booking and mini-CRM system for small service businesses. Customers book appointments online; each business owner manages their own bookings, services, and customer history through an isolated dashboard.

## Features

- **Role-based accounts** — Customer, Business Owner (Admin), or Super Admin, chosen at registration
- **Business Owner registration** — provide business name and initial services (with prices) when signing up
- **Isolated Admin Dashboard** — each owner sees only their own appointments and services; full CRUD on services
- **Customer Booking Portal** — browse businesses and services, pick a date and time slot, view all own appointments across multiple businesses
- **Appointment lifecycle** — PENDING → CONFIRMED → COMPLETED (or CANCELLED)
- **JWT authentication** — stateless, 24-hour tokens
- **Multi-tenancy** — tenants isolated by email; no cross-business data leakage
- **Dark / light mode** — persisted per browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios |
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (stateless, via `jjwt` 0.11.5) |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL 12+ |
| Build | Maven (backend) · npm / Create React App (frontend) |
| Backend hosting | Railway (Root Directory: `backend`) |
| Frontend hosting | Cloudflare Workers (via Wrangler) |
| API docs | Springdoc OpenAPI 2.3 (local only, disabled in prod) |

## Project Structure

```
small-business-booking-system/
├── backend/
│   └── src/main/
│       ├── java/com/bookingapp/
│       │   ├── config/          # SecurityConfig, OpenApiConfig, JwtConfig, DataInitializer
│       │   ├── controller/      # AuthController, BusinessController, AppointmentController
│       │   ├── service/         # AuthService, AppointmentService
│       │   ├── repository/      # Spring Data JPA interfaces
│       │   ├── model/           # User, Business, Service, Appointment, TimeSlot
│       │   ├── dto/             # Request / Response DTOs
│       │   └── exception/       # ResourceNotFoundException, GlobalExceptionHandler
│       └── resources/
│           ├── application.yml          # Shared base config
│           ├── application-local.yml    # Local dev overrides (local DB, show-sql)
│           └── application-prod.yml     # Production overrides (env vars, no Swagger)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/             # Axios clients (auth, appointments, businesses)
│   │   ├── components/      # Navbar, TableControls
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useTableFilter
│   │   └── pages/           # LoginPage, RegisterPage, AppointmentsPage, DashboardPage, SuperAdminPage
│   ├── wrangler.jsonc       # Cloudflare Workers SPA routing config
│   └── .env.example         # Environment variable template
└── docs/
    ├── API_ENDPOINTS.md
    ├── ARCHITECTURE.md
    ├── DB_DIAGRAM.md
    └── SETUP.md
```

## Local Development

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Node.js 18+ / npm

### 1. Database

```sql
CREATE DATABASE booking_system_db;
CREATE USER booking_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE booking_system_db TO booking_user;
```

### 2. Backend

```bash
cd backend
# Activate the 'local' Spring profile (uses application-local.yml)
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
# → http://localhost:8080
# → Swagger UI: http://localhost:8080/swagger-ui.html
```

The `local` profile reads DB credentials from `application-local.yml`. You can override them via environment variables.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: set REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
npm install
npm start
# → http://localhost:3000
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | `local` or `prod` | *(none — base config only)* |
| `APP_JWT_SECRET` | JWT signing secret (≥ 64 chars, base64) | dev placeholder |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `SPRING_DATASOURCE_URL` | JDBC URL (prod only) | — |
| `SPRING_DATASOURCE_USERNAME` | DB username (prod only) | — |
| `SPRING_DATASOURCE_PASSWORD` | DB password (prod only) | — |
| `PORT` | HTTP port | `8080` |

### Frontend

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_BASE_URL` | Full base URL of the backend API, e.g. `https://api.makooka.com/api/v1` |

## Deployment

### Backend — Railway

1. Create a Railway service pointing to this repository.
2. Set **Root Directory** to `backend` in the Railway service settings.
3. Set environment variables: `SPRING_PROFILES_ACTIVE=prod`, `APP_JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`, and the `SPRING_DATASOURCE_*` variables (Railway injects these automatically if you provision a Postgres plugin).
4. Railway injects `PORT`; the app binds to it automatically.

### Frontend — Cloudflare Workers

1. Install Wrangler: `npm install -g wrangler`
2. Set the `REACT_APP_API_BASE_URL` environment variable in Cloudflare Pages / Workers settings.
3. Build command: `npm run build`
4. Deploy: `npx wrangler deploy` (SPA routing is handled by `wrangler.jsonc`).

## API Documentation (local only)

Swagger UI is enabled only when `SPRING_PROFILES_ACTIVE=local`. It is fully disabled in production.

| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Interactive Swagger UI |
| `http://localhost:8080/v3/api-docs` | OpenAPI JSON spec |

To authenticate in Swagger UI, obtain a JWT token via `POST /api/v1/auth/login` and paste it into the **Authorize** dialog (without the `Bearer` prefix — Swagger adds it automatically).

## Demo Data

Two businesses are seeded automatically on first run (via `DataInitializer`):

| Business | Services |
|----------|---------|
| Glamour Hair Salon | Haircut ($35, 45 min), Hair Coloring ($85, 120 min), Manicure ($25, 30 min) |
| Zen Wellness Spa | Swedish Massage ($70, 60 min), Deep Tissue Massage ($95, 90 min), Facial Treatment ($60, 60 min) |

## Documentation

| File | Contents |
|------|---------|
| [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) | All REST endpoints with request/response examples |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered architecture, multi-tenancy design, auth flow |
| [docs/DB_DIAGRAM.md](docs/DB_DIAGRAM.md) | dbdiagram.io DBML script |
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup and troubleshooting guide |

## Team

- Enver Eskendarov
- Alanna Zhao

## Process Model

Scrum (Agile) — sprint-based development.

## License

MIT License
