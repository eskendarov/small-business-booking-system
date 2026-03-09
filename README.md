# Small Business Booking System

A multi-tenant web-based booking and mini-CRM system for small service businesses. Customers book appointments online; each business owner manages their own bookings, services, and customer history through an isolated dashboard.

## Features

- **Role-based accounts** — Customer or Business Owner, chosen at registration
- **Business Owner registration** — provide business name and initial services (with prices) when signing up
- **Isolated Admin Dashboard** — each owner sees only their own appointments and services; full CRUD on services
- **Customer Booking Portal** — browse businesses and services, pick a date and time slot, view all own appointments across multiple businesses
- **Appointment lifecycle** — PENDING → CONFIRMED → COMPLETED (or CANCELLED)
- **JWT authentication** — stateless, 24-hour tokens
- **Multi-tenancy** — tenants isolated by email; no cross-business data leakage

## Tech Stack

| | Technology |
|-|-----------|
| Frontend | React 18, React Router 6, Axios |
| Backend | Java 17, Spring Boot 3.x, Spring Security |
| Auth | JWT (stateless) |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL 12+ |
| Build | Maven (backend) · npm (frontend) |

## Quick Start

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
# Edit src/main/resources/application.properties if your DB credentials differ
mvn spring-boot:run
# → http://localhost:8080
```

The app auto-creates tables on first run (Hibernate DDL auto) and seeds two sample businesses with services via `DataInitializer`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

## Default demo data

Two businesses are seeded automatically (restart backend to re-seed):

| Business | Services |
|----------|---------|
| Glamour Hair Salon | Haircut ($35, 45 min), Hair Coloring ($85, 120 min), Manicure ($25, 30 min) |
| Zen Wellness Spa | Swedish Massage ($70, 60 min), Deep Tissue Massage ($95, 90 min), Facial Treatment ($60, 60 min) |

## Documentation

| File | Contents |
|------|---------|
| [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) | All REST endpoints with request/response examples |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layered architecture, multi-tenancy design, auth flow |
| [docs/DB_DIAGRAM.md](docs/DB_DIAGRAM.md) | dbdiagram.io DBML script — paste into dbdiagram.io to render |
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup and troubleshooting guide |

## Project structure

```
small-business-booking-system/
├── backend/
│   └── src/main/java/com/bookingapp/
│       ├── config/          # Security, JWT, CORS, DataInitializer
│       ├── controller/      # AuthController, BusinessController, AppointmentController
│       ├── service/         # AuthService, AppointmentService
│       ├── repository/      # Spring Data JPA interfaces
│       ├── model/           # User, Business, Service, Customer, Appointment, TimeSlot
│       ├── dto/             # Request/Response DTOs
│       └── exception/       # ResourceNotFoundException, GlobalExceptionHandler
├── frontend/
│   └── src/
│       ├── api/             # Axios clients (auth, appointments, businesses)
│       ├── context/         # AuthContext (user state, JWT)
│       └── pages/           # LoginPage, RegisterPage, AppointmentsPage, DashboardPage
└── docs/
    ├── API_ENDPOINTS.md
    ├── ARCHITECTURE.md
    ├── DB_DIAGRAM.md
    └── SETUP.md
```

## Team

- Enver Eskendarov
- Alanna Zhao

## Process Model

Scrum (Agile) — sprint-based development.

## License

MIT License
