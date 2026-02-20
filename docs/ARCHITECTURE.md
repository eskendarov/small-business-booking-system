# System Architecture

## Overview

The Small Business Booking System follows a **Layered Architecture** pattern, separating concerns into distinct layers that communicate through well-defined interfaces. This design ensures maintainability, testability, and scalability.

## Architecture Layers

### 1. Controller Layer (Presentation)
**Responsibility**: Handle HTTP requests and responses

- Receives API requests from the frontend
- Validates input parameters
- Delegates business logic to the Service layer
- Returns JSON responses to the client
- Located in: `src/main/java/com/bookingapp/controller/`

**Example Controllers**:
- `BookingController` - Handles appointment booking requests
- `CustomerController` - Manages customer information
- `BusinessOwnerController` - Admin operations
- `ServiceController` - Service management

### 2. Service Layer (Business Logic)
**Responsibility**: Implement business rules and application logic

- Contains core business logic for bookings, availability, notifications
- Handles validation and error handling
- Orchestrates operations across multiple repositories
- Implements transaction management
- Located in: `src/main/java/com/bookingapp/service/`

**Example Services**:
- `BookingService` - Booking creation, validation, cancellation
- `AvailabilityService` - Time slot management, availability calculation
- `CustomerService` - Customer data management
- `NotificationService` - Email/SMS notifications

### 3. Repository Layer (Data Access)
**Responsibility**: Manage database operations

- Uses Spring Data JPA to interact with PostgreSQL
- Hibernate ORM handles object-relational mapping
- Implements CRUD operations for each entity
- Supports custom queries using @Query annotations
- Located in: `src/main/java/com/bookingapp/repository/`

**Example Repositories**:
- `BookingRepository` - Query and persist booking records
- `CustomerRepository` - Access customer data
- `ServiceRepository` - Retrieve service information
- `TimeSlotRepository` - Manage available time slots

### 4. Model/Entity Layer (Data Representation)
**Responsibility**: Define data structures

- Maps database tables to Java objects
- Contains entity classes with JPA annotations
- Defines relationships between entities
- Located in: `src/main/java/com/bookingapp/model/`

**Core Entities**:
- `Customer` - Customer information (name, email, phone, address)
- `BusinessOwner` - Business owner account information
- `Service` - Services offered (name, duration, price, description)
- `Booking/Appointment` - Appointment records with status
- `TimeSlot` - Available time slots for each service
- `Availability` - Business hours and holidays

### 5. DTO Layer (Data Transfer)
**Responsibility**: Define objects for API communication

- Separates internal entity structure from API responses
- Prevents exposing sensitive information
- Simplifies complex data transformations
- Located in: `src/main/java/com/bookingapp/dto/`

**Example DTOs**:
- `BookingRequestDTO` - Data for creating a booking
- `BookingResponseDTO` - Data returned from booking creation
- `CustomerDTO` - Customer information for API responses

### 6. Exception Handling Layer
**Responsibility**: Manage application errors

- Custom exceptions for specific business scenarios
- Global exception handler using @ControllerAdvice
- Consistent error response format
- Located in: `src/main/java/com/bookingapp/exception/`

## Database Schema Overview

### Core Tables

**customers**
- id (Primary Key)
- name
- email
- phone
- address
- created_at
- updated_at

**business_owners**
- id (Primary Key)
- name
- email
- phone
- business_name
- created_at
- updated_at

**services**
- id (Primary Key)
- business_owner_id (Foreign Key)
- name
- description
- duration_minutes
- price
- created_at
- updated_at

**bookings/appointments**
- id (Primary Key)
- customer_id (Foreign Key)
- service_id (Foreign Key)
- business_owner_id (Foreign Key)
- appointment_date
- appointment_time
- status (PENDING, CONFIRMED, CANCELLED)
- created_at
- updated_at

**time_slots**
- id (Primary Key)
- service_id (Foreign Key)
- date
- start_time
- end_time
- is_available
- created_at
- updated_at

**availability**
- id (Primary Key)
- business_owner_id (Foreign Key)
- day_of_week
- start_time
- end_time
- created_at
- updated_at

## Communication Between Frontend and Backend

### REST API Communication Flow

1. **Frontend (React)** sends HTTP request to Backend (Spring Boot)
2. **Controller** receives the request and validates input
3. **Service** processes business logic
4. **Repository** queries or updates the database via Hibernate
5. **Database** (PostgreSQL) stores/retrieves data
6. **Repository** returns data to Service
7. **Service** returns result to Controller
8. **Controller** formats response as JSON DTO
9. **Frontend** receives and displays the response

### API Request/Response Example

**Request** (Create Booking):
```
POST /api/bookings
Content-Type: application/json

{
  "customerId": 1,
  "serviceId": 5,
  "appointmentDate": "2026-03-15",
  "appointmentTime": "14:00"
}
```

**Response** (Success):
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 42,
  "customerId": 1,
  "serviceId": 5,
  "appointmentDate": "2026-03-15",
  "appointmentTime": "14:00",
  "status": "CONFIRMED",
  "createdAt": "2026-02-19T10:30:00Z"
}
```

## Data Flow Diagram
```
Frontend (React)
    ↓ HTTP Request (JSON)
Controller (REST Endpoint)
    ↓ Method Call
Service (Business Logic)
    ↓ Method Call
Repository (Data Access)
    ↓ SQL Query
Database (PostgreSQL)
    ↑ Result Set
Repository
    ↑ Entity Objects
Service
    ↑ Business Objects
Controller
    ↓ Convert to DTO
Frontend (JSON Response)
```

## Key Design Patterns

### 1. **Layered Architecture**
Separates concerns into distinct layers for better maintainability and testability.

### 2. **Repository Pattern**
Abstracts database operations, making it easy to change data sources without affecting business logic.

### 3. **Service Locator Pattern**
Services are injected into controllers, enabling loose coupling and easier testing.

### 4. **DTO (Data Transfer Object)**
Separates internal entity structure from external API contracts.

### 5. **Dependency Injection (Spring)**
Spring manages object creation and dependencies, reducing boilerplate code.

## Deployment Architecture (Future)

The application can be deployed in a production environment as follows:

- **Frontend**: Deployed to a web server (nginx, Apache) or CDN (AWS CloudFront)
- **Backend**: Deployed to a Java application server (Tomcat, Docker container)
- **Database**: Managed PostgreSQL instance (AWS RDS, Google Cloud SQL)
- **Communication**: HTTPS/REST API for secure client-server communication

## Security Considerations

- **Authentication**: JWT tokens or Spring Security for user authentication
- **Authorization**: Role-based access control (RBAC) for different user types
- **Input Validation**: Server-side validation for all API inputs
- **SQL Injection Prevention**: Use parameterized queries (Spring Data JPA)
- **CORS**: Configure Cross-Origin Resource Sharing for frontend access
- **HTTPS**: Enforce HTTPS in production environments

---

**Last Updated**: February 2026
