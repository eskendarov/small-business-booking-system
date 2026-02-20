# API Endpoints

Base URL: `http://localhost:8080/api/v1`

## Authentication

| Method | Endpoint           | Description           | Access  |
|--------|--------------------|-----------------------|---------|
| POST   | /auth/register     | Register new user     | Public  |
| POST   | /auth/login        | Login, returns JWT    | Public  |

## Businesses

| Method | Endpoint              | Description                  | Access      |
|--------|-----------------------|------------------------------|-------------|
| POST   | /businesses           | Register a new business      | Super Admin |
| GET    | /businesses           | List all businesses          | Super Admin |
| GET    | /businesses/{id}      | Get business by ID           | Admin       |
| PUT    | /businesses/{id}      | Update business details      | Admin       |

## Services

| Method | Endpoint                        | Description               | Access  |
|--------|---------------------------------|---------------------------|---------|
| POST   | /businesses/{id}/services       | Add a service             | Admin   |
| GET    | /businesses/{id}/services       | List services             | Public  |
| PUT    | /services/{id}                  | Update a service          | Admin   |
| DELETE | /services/{id}                  | Delete a service          | Admin   |

## Appointments

| Method | Endpoint                           | Description               | Access   |
|--------|------------------------------------|---------------------------|----------|
| POST   | /appointments                      | Book an appointment       | Customer |
| GET    | /appointments                      | List all appointments     | Admin    |
| GET    | /appointments/{id}                 | Get appointment details   | Admin    |
| PUT    | /appointments/{id}/status          | Confirm or cancel         | Admin    |
| DELETE | /appointments/{id}                 | Delete appointment        | Admin    |

## Customers (Mini-CRM)

| Method | Endpoint                           | Description               | Access  |
|--------|------------------------------------|---------------------------|---------|
| GET    | /businesses/{id}/customers         | List all customers        | Admin   |
| GET    | /customers/{id}                    | Get customer details      | Admin   |
| PUT    | /customers/{id}                    | Update customer info      | Admin   |
| DELETE | /customers/{id}                    | Remove customer           | Admin   |

## Time Slots

| Method | Endpoint                              | Description                  | Access  |
|--------|---------------------------------------|------------------------------|---------|
| POST   | /services/{id}/timeslots              | Add available time slot      | Admin   |
| GET    | /services/{id}/timeslots              | Get available slots          | Public  |
| DELETE | /timeslots/{id}                       | Remove a time slot           | Admin   |
