# DB Diagram — Small Business Booking System

Paste the script below into **[dbdiagram.io](https://dbdiagram.io)** to render the diagram.

---

```dbml
// Small Business Booking System
// Generated: March 2026
// https://dbdiagram.io

Table users {
  id           bigint      [pk, increment]
  name         varchar     [not null]
  email        varchar     [unique, not null]
  password     varchar     [not null, note: 'bcrypt hash']
  role         varchar     [not null, note: 'CUSTOMER | ADMIN | SUPER_ADMIN']
  created_at   timestamp
  updated_at   timestamp

  Note: 'App users. ADMIN role is linked to a business row by matching email.'
}

Table businesses {
  id            bigint     [pk, increment]
  business_name varchar    [not null]
  owner_name    varchar    [not null]
  email         varchar    [unique, not null, note: 'Must match users.email for the owner']
  phone         varchar
  address       varchar
  created_at    timestamp
  updated_at    timestamp

  Note: 'Created automatically when a user registers as Business Owner (ADMIN).'
}

Table services {
  id               bigint    [pk, increment]
  business_id      bigint    [not null, ref: > businesses.id]
  name             varchar   [not null]
  description      varchar
  duration_minutes int       [note: 'positive integer']
  price            decimal   [note: 'positive, e.g. 35.00']
  created_at       timestamp
  updated_at       timestamp
}

Table customers {
  id         bigint    [pk, increment]
  name       varchar   [not null]
  email      varchar   [unique, not null, note: 'Matches users.email for CUSTOMER role users']
  phone      varchar
  address    varchar
  created_at timestamp
  updated_at timestamp

  Note: 'Auto-created on first appointment booking if email not already registered.'
}

Table appointments {
  id               bigint    [pk, increment]
  customer_id      bigint    [not null, ref: > customers.id]
  service_id       bigint    [not null, ref: > services.id]
  business_id      bigint    [not null, ref: > businesses.id]
  appointment_date date      [not null]
  appointment_time time      [not null]
  status           varchar   [not null, note: 'PENDING | CONFIRMED | CANCELLED | COMPLETED']
  notes            text
  created_at       timestamp
  updated_at       timestamp
}

Table time_slots {
  id           bigint     [pk, increment]
  service_id   bigint     [not null, ref: > services.id]
  date         date       [not null]
  start_time   time       [not null]
  end_time     time       [not null]
  is_available boolean    [default: true]
  created_at   timestamp
  updated_at   timestamp
}
```

---

## Relationships summary

| From | To | Type | Note |
|------|----|------|------|
| `services.business_id` | `businesses.id` | Many-to-One | A business has many services |
| `appointments.customer_id` | `customers.id` | Many-to-One | A customer has many appointments |
| `appointments.service_id` | `services.id` | Many-to-One | A service has many appointments |
| `appointments.business_id` | `businesses.id` | Many-to-One | A business has many appointments |
| `time_slots.service_id` | `services.id` | Many-to-One | A service has many time slots |

### Logical (email-based, no FK)

| Relationship | How |
|---|---|
| `users` ↔ `businesses` | `users.email = businesses.email` (for ADMIN role) |
| `users` ↔ `customers` | `users.email = customers.email` (for CUSTOMER role) |
