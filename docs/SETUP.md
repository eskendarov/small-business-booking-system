# Setup Instructions

This guide provides step-by-step instructions for setting up the Small Business Booking System backend on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)**: Version 17 or higher
  - Download from: https://www.oracle.com/java/technologies/downloads/
  - Verify installation: `java -version`

- **Apache Maven**: Version 3.6 or higher
  - Download from: https://maven.apache.org/download.cgi
  - Verify installation: `mvn -version`

- **PostgreSQL**: Version 12 or higher
  - Download from: https://www.postgresql.org/download/
  - Verify installation: `psql --version`

- **Git**: For version control
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

- **IDE** (Optional but recommended):
  - IntelliJ IDEA Community Edition
  - Eclipse IDE
  - VS Code with Extension Pack for Java

## Step 1: Clone the Repository

1. Open your terminal/command prompt
2. Navigate to the directory where you want to clone the project
3. Run the following command:
```bash
git clone https://github.com/yourusername/small-business-booking-system.git
cd small-business-booking-system
```

## Step 2: Set Up PostgreSQL Database

### 2.1 Create a New Database

1. Open PostgreSQL (via psql or pgAdmin)
2. Create a new database:
```sql
CREATE DATABASE booking_system_db;
```

3. Create a database user:
```sql
CREATE USER booking_user WITH PASSWORD 'your_secure_password';
```

4. Grant privileges to the user:
```sql
ALTER ROLE booking_user SET client_encoding TO 'utf8';
ALTER ROLE booking_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE booking_user SET default_transaction_deferrable TO on;
ALTER ROLE booking_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE booking_system_db TO booking_user;
```

### 2.2 Verify Database Connection

Test the connection:
```bash
psql -h localhost -U booking_user -d booking_system_db
```

Type `\q` to exit the PostgreSQL prompt.

## Step 3: Configure Backend Application

1. Navigate to the backend folder:
```bash
cd backend
```

2. Open `src/main/resources/application.properties`

3. Update the database configuration:
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/booking_system_db
spring.datasource.username=booking_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Logging Configuration
logging.level.root=INFO
logging.level.com.bookingapp=DEBUG
```

**Note**: Replace `your_secure_password` with the password you created for the `booking_user`.

## Step 4: Build the Backend Application

1. Ensure you are in the `backend` directory
2. Run Maven clean install:
```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the source code
- Run unit tests (if any)
- Package the application

**Note**: First build may take a few minutes as Maven downloads dependencies.

## Step 5: Run the Backend Application

### Option 1: Using Maven Spring Boot Plugin (Recommended)
```bash
mvn spring-boot:run
```

### Option 2: Run the JAR File
```bash
java -jar target/booking-app-0.0.1-SNAPSHOT.jar
```

The application will start and you should see output like:
```
2026-02-19 10:30:00.123 INFO 12345 --- [ main] com.bookingapp.BookingAppApplication : Started BookingAppApplication in 3.456 seconds (JVM running for 5.678)
```

## Step 6: Verify Backend is Running

1. Open your browser or use curl to test the API:
```bash
curl -X GET http://localhost:8080/api/health
```

Or visit in browser: `http://localhost:8080/api/health`

You should receive a successful response.

## Step 7: Database Initialization (Hibernate)

When the application starts for the first time:

1. Hibernate will automatically create tables based on your entity classes
2. You should see SQL statements in the console output
3. All tables defined in your entities will be created in PostgreSQL

To verify tables were created:
```bash
psql -h localhost -U booking_user -d booking_system_db -c "\dt"
```

## Troubleshooting

### Issue: "Connection refused" - PostgreSQL not running

**Solution**: Start PostgreSQL service
- **Windows**: Open Services and start PostgreSQL
- **macOS**: `brew services start postgresql`
- **Linux**: `sudo systemctl start postgresql`

### Issue: "Database does not exist"

**Solution**: Ensure database was created
```sql
\l  -- Lists all databases
```

### Issue: "Authentication failed for user"

**Solution**: Verify credentials in `application.properties` match your PostgreSQL setup

### Issue: "Port 8080 already in use"

**Solution**: Change port in `application.properties`:
```properties
server.port=8081
```

### Issue: Maven build fails with "not recognized as an internal or external command"

**Solution**: Ensure Maven is installed and added to system PATH
- Verify: `mvn -version`
- Add Maven `bin` folder to system PATH

## Next Steps

1. **Create Sample Data**: 
   - Add sample customers, services, and bookings to test the API

2. **Test API Endpoints**:
   - Use Postman or Insomnia to test REST endpoints
   - See [docs/API_ENDPOINTS.md](API_ENDPOINTS.md) for endpoint documentation

3. **Frontend Setup** (When Ready):
   - Follow frontend setup instructions in `frontend/README.md`

4. **Version Control**:
   - Make initial commit: `git add .` then `git commit -m "Initial backend setup"`
   - Push to GitHub: `git push origin main`

## Development Workflow

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and test locally

3. Commit changes:
```bash
git commit -m "Add your commit message"
```

4. Push to GitHub:
```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request on GitHub for code review

## IDE Setup (Optional)

### IntelliJ IDEA

1. File → Open → Select `small-business-booking-system` folder
2. Mark `src/main/java` as Sources Root
3. Mark `src/main/resources` as Resources Root
4. Configure JDK: File → Project Structure → Project → Set JDK 17+
5. Run application: Click the green Run button or press Shift+F10

### VS Code

1. Install "Extension Pack for Java" extension
2. Open the project folder
3. VS Code will auto-detect Maven project
4. Create `.vscode/launch.json` for debugging

---

**Last Updated**: February 2026
