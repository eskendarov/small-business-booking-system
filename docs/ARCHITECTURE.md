# System Architecture

## Overview

The Small Business Booking System is a multi-tenant full-stack web application following a **Layered Architecture** pattern. Each business owner (ADMIN) operates in isolation — they see only their own services and appointments. Customers can book across multiple businesses and see all of their appointments in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Java 17, Spring Boot 3.x |
| Auth | Spring Security + JWT (stateless) |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL 12+ |
| Build | Maven (backend), npm (frontend) |

---

## Architecture Layers

### 1. Controller Layer — `com.bookingapp.controller`

Handles HTTP requests, validates input, delegates to the service layer, returns JSON.

| Controller | Responsibilities |
|-----------|-----------------|
| `AuthController` | Register (with business/services), login |
| `BusinessController` | List businesses, manage own business's services |
| `AppointmentController` | Book, list (role-filtered), update status, delete |

### 2. Service Layer — `com.bookingapp.service`

Contains all business logic and transaction management.

| Service | Responsibilities |
|---------|----------------|
| `AuthService` | Register user → create Business + Services for ADMIN role; JWT login |
| `AppointmentService` | Create appointment (auto-creates Customer if needed); role-aware listing |

### 3. Repository Layer — `com.bookingapp.repository`

Spring Data JPA repositories — standard CRUD + custom queries.

| Repository | Key custom methods |
|-----------|-------------------|
| `UserRepository` | `findByEmail`, `existsByEmail` |
| `BusinessRepository` | `findByEmail` (used for multi-tenancy lookup) |
| `ServiceRepository` | `findByBusinessId` |
| `CustomerRepository` | `findByEmail`, `findByNameContainingIgnoreCase` |
| `AppointmentRepository` | `findByCustomerId`, `findByBusinessId`, `findByBusinessIdAndAppointmentDate` |
| `TimeSlotRepository` | `findByServiceIdAndIsAvailableTrue`, `findByServiceIdAndDate` |

### 4. Model / Entity Layer — `com.bookingapp.model`

JPA entities mapped to PostgreSQL tables.

| Entity | Table | Key fields |
|--------|-------|-----------|
| `User` | `users` | id, name, email, password, role |
| `Business` | `businesses` | id, businessName, ownerName, email |
| `Service` | `services` | id, name, durationMinutes, price, business_id |
| `Customer` | `customers` | id, name, email |
| `Appointment` | `appointments` | id, customer_id, service_id, business_id, date, time, status |
| `TimeSlot` | `time_slots` | id, service_id, date, startTime, endTime, isAvailable |

### 5. DTO Layer — `com.bookingapp.dto`

Separates internal entities from API contracts.

| DTO | Direction | Purpose |
|-----|-----------|---------|
| `RegisterRequest` | IN | name, email, password, role, businessName, services[] |
| `AuthRequest` | IN | email, password |
| `AuthResponse` | OUT | token, email, role |
| `AppointmentRequest` | IN | businessId, serviceId, date, time, notes |
| `AppointmentResponse` | OUT | full appointment with nested names |
| `BusinessResponse` | OUT | id, businessName, ownerName, email, phone, address |
| `ServiceResponse` | OUT | id, name, description, durationMinutes, price, businessId |
| `ServiceInput` | IN | name, description, durationMinutes, price |

### 6. Exception Handling — `com.bookingapp.exception`

Global `@ControllerAdvice` handler returns consistent JSON error responses.

---

## Multi-Tenancy Design

Business isolation is enforced at the service layer using email as the tenant key:

```
users.email  ==  businesses.email   (for ADMIN role)
users.email  ==  customers.email    (for CUSTOMER role, auto-created on first booking)
```

No FK exists between these tables — the link is logical. This allows the same person to switch roles in future without schema changes.

**Appointment access rules:**

| Role | `GET /appointments` returns |
|------|-----------------------------|
| `CUSTOMER` | Use `GET /appointments/my` — own appointments only |
| `ADMIN` | Appointments for their business only (`businessRepository.findByEmail(userEmail)`) |
| `SUPER_ADMIN` | All appointments |

---

## Authentication Flow

```
POST /auth/login
  → AuthenticationManager validates credentials
  → JwtUtil.generateToken(email)
  → Returns { token, email, role }

Every subsequent request:
  → JwtAuthFilter extracts email from token
  → Loads UserDetails by email
  → Sets SecurityContext
  → Controller uses @AuthenticationPrincipal UserDetails
```

JWT expiry: **24 hours** (`app.jwt.expiration-ms=86400000`)

---

## Request / Response Flow

```
React Frontend
  ↓  HTTP + Authorization: Bearer <token>
AppointmentController  (validates input, reads @AuthenticationPrincipal)
  ↓
AppointmentService     (business logic, role check, auto-create Customer)
  ↓
Repositories           (Spring Data JPA)
  ↓
PostgreSQL
  ↑
AppointmentService     (maps Appointment → AppointmentResponse DTO)
  ↑
Controller             (ResponseEntity.ok(dto))
  ↑
React Frontend         (renders table / updates state)
```

---

## Frontend Structure — `frontend/src`

```
api/
  apiClient.js        Axios instance with JWT interceptor + 401 redirect
  auth.js             register, login
  appointments.js     getAll, getMy, create, updateStatus, delete
  businesses.js       getAll, getMyBusiness, getServices, addService, deleteService

context/
  AuthContext.js      user state (email, role, token), login(), logout()

pages/
  LoginPage.js        Email + password form
  RegisterPage.js     Role toggle → Customer form OR Business Owner form (business + services)
  AppointmentsPage.js Customer view — own appointments + booking modal (time select dropdown)
  DashboardPage.js    Admin view — business info, service management, appointment management

App.js                Role-based routing:
                        /appointments  → PrivateRoute (any authenticated)
                        /dashboard     → PrivateRoute (adminOnly — blocks CUSTOMER)
                        /              → HomeRedirect (CUSTOMER→/appointments, ADMIN→/dashboard)
```

---

## Database Schema

See [DB_DIAGRAM.md](DB_DIAGRAM.md) for the full dbdiagram.io DBML script.

---

## Security

| Concern | Implementation |
|---------|---------------|
| Authentication | Stateless JWT, 24h expiry |
| Password storage | bcrypt via Spring `PasswordEncoder` |
| Authorization | Spring Security `@AuthenticationPrincipal` + role checks in service layer |
| CORS | Configured for `http://localhost:3000` |
| SQL injection | Prevented by Spring Data JPA parameterized queries |
| Tenant isolation | Email-based lookup — admins can only access their own business's data |

---

**Last Updated**: March 2026
