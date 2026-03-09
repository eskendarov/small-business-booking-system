# API Endpoints

Base URL: `http://localhost:8080/api/v1`

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register as Customer or Business Owner | Public |
| POST | `/auth/login` | Login, returns JWT + role | Public |

### POST `/auth/register`

**Customer:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

**Business Owner (ADMIN):**
```json
{
  "name": "Anna Smith",
  "email": "anna@salon.com",
  "password": "password123",
  "role": "ADMIN",
  "businessName": "Glamour Hair Salon",
  "services": [
    { "name": "Haircut", "durationMinutes": 45, "price": 35.00 },
    { "name": "Hair Coloring", "durationMinutes": 120, "price": 85.00 }
  ]
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "email": "anna@salon.com",
  "role": "ADMIN"
}
```

### POST `/auth/login`

```json
{ "email": "jane@example.com", "password": "password123" }
```

---

## Businesses

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/businesses` | List all businesses | Public |
| GET | `/businesses/my` | Get the authenticated owner's business | ADMIN |
| GET | `/businesses/{id}/services` | List services for a business | Public |
| POST | `/businesses/my/services` | Add a service to own business | ADMIN |
| DELETE | `/businesses/my/services/{serviceId}` | Remove a service from own business | ADMIN |

### POST `/businesses/my/services`

```json
{
  "name": "Manicure",
  "description": "Classic manicure",
  "durationMinutes": 30,
  "price": 25.00
}
```

---

## Appointments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/appointments` | Book an appointment | Customer |
| GET | `/appointments` | List appointments (ADMIN → own business only; SUPER_ADMIN → all) | ADMIN / SUPER_ADMIN |
| GET | `/appointments/my` | List the authenticated customer's own appointments | Customer |
| GET | `/appointments/{id}` | Get appointment by ID | Authenticated |
| PUT | `/appointments/{id}/status` | Update status (`?status=CONFIRMED\|CANCELLED\|COMPLETED`) | ADMIN |
| DELETE | `/appointments/{id}` | Delete appointment | ADMIN |

### POST `/appointments`

```json
{
  "businessId": 1,
  "serviceId": 2,
  "appointmentDate": "2026-04-15",
  "appointmentTime": "14:00:00",
  "notes": "First visit"
}
```

**Response:**
```json
{
  "id": 42,
  "customerId": 7,
  "customerName": "Jane Doe",
  "businessId": 1,
  "businessName": "Glamour Hair Salon",
  "serviceId": 2,
  "serviceName": "Haircut",
  "appointmentDate": "2026-04-15",
  "appointmentTime": "14:00:00",
  "status": "PENDING",
  "notes": "First visit",
  "createdAt": "2026-03-09T10:30:00"
}
```

### PUT `/appointments/{id}/status`

```
PUT /api/v1/appointments/42/status?status=CONFIRMED
```

---

## Multi-tenancy rules

- **CUSTOMER** calls `GET /appointments/my` → sees only their own appointments (across all businesses).
- **ADMIN** calls `GET /appointments` → sees only appointments for **their own** business.
- **SUPER_ADMIN** calls `GET /appointments` → sees all appointments across all businesses.
- Businesses are isolated: an ADMIN cannot read or modify another business's appointments or services.

---

## Status flow

```
PENDING → CONFIRMED → COMPLETED
PENDING → CANCELLED
CONFIRMED → CANCELLED
```
