# Small Business Booking System

A comprehensive web-based booking and mini-CRM system designed for small service-based businesses. This application enables customers to request appointments online while allowing business owners to manage bookings, availability, customer information, and business operations efficiently.

## Project Overview

The Small Business Booking System is a full-stack web application built to solve the challenge of manual appointment scheduling for small businesses. Whether you run a salon, consulting firm, fitness studio, or any service-based business, this system provides an intuitive platform for customers to book appointments and for business owners to manage their operations.

### Key Features

- **Customer Booking Portal**: Customers can browse available services, view time slots, and book appointments online
- **Business Owner Dashboard**: Manage bookings, set availability, view customer history, and handle cancellations
- **Customer Management**: Store and organize customer information, contact details, and booking history
- **Service Management**: Create and manage different services offered by the business with pricing and duration
- **Availability Management**: Set business hours, holidays, and block out unavailable time slots
- **Appointment Management**: View, edit, and cancel appointments with automatic notifications
- **Role-Based Access Control**: Separate dashboards and permissions for customers and business owners

## Tech Stack

- **Backend**: Java with Spring Boot 3.x
- **ORM**: Hibernate with Spring Data JPA
- **Database**: PostgreSQL
- **Frontend**: React.js
- **Build Tool**: Maven
- **Version Control**: Git & GitHub

## Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Git

### Backend Setup

1. Clone the repository
2. Navigate to backend folder: `cd backend`
3. Configure PostgreSQL database in `src/main/resources/application.properties`
4. Run Maven build: `mvn clean install`
5. Start the application: `mvn spring-boot:run`
6. Backend will run on `http://localhost:8080`

For detailed setup instructions, see [docs/SETUP.md](docs/SETUP.md).

## Architecture

This project follows a layered architecture pattern with clear separation of concerns. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Team

- Enver Eskendarov
- Alanna Zhao

## Process Model

This project follows **Scrum (Agile)** methodology with sprint-based development cycles.

## License

MIT License - see LICENSE file for details
