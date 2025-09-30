# CRM Backend API

## Overview

This is a comprehensive Customer Relationship Management (CRM) backend application with **JWT authentication** and **role-based access control**. The system provides secure CRUD functionality for managing clients, leads, invoices, payments, and users. Built using **NestJS** framework with **TypeScript**, **TypeORM** for database management, **PostgreSQL** as the primary database, **Redis** for caching and job queues, and **Docker** for containerization.

### Key Features

- **JWT Authentication** with bcrypt password hashing
- **Role-based Access Control** (Admin, Accountant, Sales)
- **Prometheus Metrics** and structured logging
- **Background Job Processing** with Bull/Redis
- **Comprehensive Testing** (Unit, Integration, E2E)
- **OpenAPI/Swagger Documentation**
- **Clean Architecture** (DDD implementation in leads module)
- **Request/Response Logging** with authentication context

## Setup Instructions

Follow these step-by-step instructions to install and run the application:

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crm-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory with the following configuration:

   ```env
   # Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=postgres_db_name

   # Test Database Configuration
   TEST_POSTGRES_HOST=localhost
   TEST_POSTGRES_PORT=5433
   TEST_POSTGRES_USER=your_postgres_user
   TEST_POSTGRES_PASSWORD=your_test_postgres_password
   TEST_POSTGRES_DB=postgres_test_db_name

   # Redis Configuration (for caching and job queues)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password

   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h

   # Application Environment
   NODE_ENV=development
   PORT=3000

   # CORS Configuration (optional)
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

   # Email Configuration (for notifications)
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=your_mailtrap_user
   MAIL_PASS=your_mailtrap_password
   MAIL_FROM=noreply@crm-backend.com
   ```

4. **Start database services**

   ```bash
   docker-compose up -d
   ```

   This will start both the main PostgreSQL database (port 5432) and test PostgreSQL database (port 5433).

5. **Build the application**

   ```bash
   npm run build
   ```

6. **Run database migrations**

   For main database:

   ```bash
   npm run migrate:main
   ```

   For test database:

   ```bash
   npm run migrate:test
   ```

   Or run migrations on both databases:

   ```bash
   npm run migrate:both
   ```

7. **Seed databases (optional)**

   For main database:

   ```bash
   npm run seed
   ```

   For test database:

   ```bash
   npm run seed:test
   ```

   Or seed both databases:

   ```bash
   npm run seed:both
   ```

8. **Start the application**

   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

The API will be available at `http://localhost:3000`
**API Documentation**: `http://localhost:3000/api` (Swagger/OpenAPI)
**Metrics**: `http://localhost:3000/metrics` (Prometheus format)

## Authentication & Authorization

### Authentication Flow

1. **Login**: POST to `/auth/login` with email and password
2. **Token**: Receive JWT access token in response
3. **Authorization**: Include token in `Authorization: Bearer <token>` header for protected endpoints

### Default Users (created by seeding)

```bash
# Admin User
Email: admin@example.com
Password: securePassword123
Role: admin (full access)

# Accountant User
Email: accountant@example.com
Password: securePassword123
Role: accountant (invoices, payments, clients)

# Sales User
Email: sales@example.com
Password: securePassword123
Role: sales (leads, clients)
```

### Role-Based Permissions

- **Admin**: Full access to all endpoints
- **Accountant**: Can manage invoices, invoice items, payments, and view clients
- **Sales**: Can manage leads and clients

### Using Authentication

#### cURL Example

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securePassword123"}'

# 2. Use token in subsequent requests
curl -X GET http://localhost:3000/invoices \
  -H "Authorization: Bearer <your-jwt-token>"
```

#### Postman Collection

Import the provided Postman collection and environment files:

- **Collection**: `postman/CRM-Backend-API.postman_collection.json`
- **Environment**: `postman/CRM-Backend-Environment.postman_environment.json`

The collection includes:

- Pre-configured authentication requests for all roles
- Automatic token storage and usage
- Complete endpoint coverage with examples
- Role-based request organization

<details>
<summary><strong>API Endpoints</strong></summary>

### Authentication

- **POST** `/auth/login` - Authenticate user and get JWT token
  ```json
  {
    "email": "admin@example.com",
    "password": "securePassword123"
  }
  ```
  **Response**: `{ "access_token": "jwt.token.here" }`

### Users Management _Requires Authentication_

- **POST** `/users` - Create new user _(Admin only)_
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "admin" // admin | sales | accountant
  }
  ```
- **GET** `/users` - Get all users _(Admin only)_
- **GET** `/users/:id` - Get user by ID
- **PUT** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user _(Admin only)_

### Clients Management _Requires Authentication_

- **POST** `/clients` - Create new client
  ```json
  {
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "address": "123 Business St, City, State"
  }
  ```
- **GET** `/clients` - Get all clients
- **GET** `/clients/:id` - Get client by ID
- **PUT** `/clients/:id` - Update client
- **DELETE** `/clients/:id` - Delete client _(Admin only)_
- **GET** `/clients/total/:id` - Get client invoice total

### Leads Management _Requires Authentication_ _(Clean Architecture/DDD)_

- **POST** `/leads` - Create new lead
  ```json
  {
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "company": "Tech Solutions Inc",
    "source": "website",
    "notes": "Interested in our enterprise package"
  }
  ```
- **GET** `/leads` - Get all leads
- **GET** `/leads/:id` - Get lead by ID
- **PUT** `/leads/:id` - Update lead
- **DELETE** `/leads/:id` - Delete lead _(Admin only)_
- **GET** `/leads/:id/enrichment` - Start lead enrichment (background job)
- **GET** `/leads/:id/enrichment/status/:jobId` - Check enrichment status

### Invoices Management _Requires Authentication_

- **POST** `/invoices` - Create new invoice _(Admin/Accountant only)_
  ```json
  {
    "clientId": 1,
    "amount": 1500.0,
    "status": "pending",
    "issueDate": "2024-01-15",
    "dueDate": "2024-02-15",
    "description": "Monthly consulting services"
  }
  ```
- **GET** `/invoices` - Get all invoices (supports filtering by status)
- **GET** `/invoices/:id` - Get invoice by ID
- **PUT** `/invoices/:id` - Update invoice _(Admin/Accountant only)_
- **DELETE** `/invoices/:id` - Delete invoice _(Admin only)_
- **GET** `/invoices/:id/pdf` - Generate invoice PDF (background job)
- **GET** `/invoices/:id/pdf/status/:jobId` - Check PDF generation status

### Invoice Items Management _Requires Authentication_

- **POST** `/invoice-items` - Create new invoice item _(Admin/Accountant only)_
  ```json
  {
    "invoiceId": 1,
    "description": "Web Development Services",
    "quantity": 40,
    "unitPrice": 75.0,
    "lineTotal": 3000.0
  }
  ```
- **GET** `/invoice-items` - Get all invoice items
- **GET** `/invoice-items/:id` - Get invoice item by ID
- **PUT** `/invoice-items/:id` - Update invoice item _(Admin/Accountant only)_
- **DELETE** `/invoice-items/:id` - Delete invoice item _(Admin only)_

### Payments Management _Requires Authentication_

- **POST** `/payments` - Create new payment _(Admin/Accountant only)_
  ```json
  {
    "invoiceId": 1,
    "amount": 1500.0,
    "paymentDate": "2024-01-20",
    "method": "credit_card",
    "reference": "CC-2024-001"
  }
  ```
- **GET** `/payments` - Get all payments
- **GET** `/payments/:id` - Get payment by ID
- **PUT** `/payments/:id` - Update payment _(Admin/Accountant only)_
- **DELETE** `/payments/:id` - Delete payment _(Admin only)_

### Monitoring & Metrics

- **GET** `/metrics` - Prometheus metrics (no authentication required)
  - API request metrics (duration, status codes, endpoints)
  - Business metrics (leads, clients, invoices, payments counts)
  - System health metrics

</details>

<details>
<summary><strong>🗄️ Database Structure</strong></summary>

![Database Schema](https://github.com/Ayogoharo/crm-backend/edit/main/schema.png)

The database consists of six main entities with the following relationships:

### **Users Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `email` (unique), `username` (unique), `password`, `full_name`, `role`, `created_at`, `updated_at`
- **Roles**: admin, sales, accountant
- **Relationships**:
  - One-to-Many with Leads (as owner)
  - One-to-Many with Invoices (as issuer)
  - One-to-Many with Payments (as recorder)

### **Clients Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `name`, `email`, `phone`, `address`, `created_at`, `updated_at`
- **Relationships**:
  - One-to-Many with Leads
  - One-to-Many with Invoices

### **Leads Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `client_id`, `owner_id`, `status`, `source`, `notes`, `created_at`, `updated_at`
- **Status Values**: new, contacted, qualified, won, lost
- **Relationships**:
  - Many-to-One with Clients (CASCADE delete)
  - Many-to-One with Users (SET NULL on delete)

### **Invoices Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `client_id`, `issued_by`, `invoice_date`, `due_date`, `status`, `total_amount`, `created_at`, `updated_at`
- **Status Values**: draft, sent, paid, overdue, cancelled
- **Relationships**:
  - Many-to-One with Clients (CASCADE delete)
  - Many-to-One with Users (SET NULL on delete)
  - One-to-Many with Invoice Items
  - One-to-Many with Payments

### **Invoice Items Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `invoice_id`, `description`, `quantity`, `unit_price`, `line_total`
- **Relationships**:
  - Many-to-One with Invoices (CASCADE delete)

### **Payments Table**

- **Primary Key**: `id` (auto-increment)
- **Fields**: `invoice_id`, `recorded_by`, `payment_date`, `amount`, `method`, `reference`, `created_at`
- **Payment Methods**: cash, bank_transfer, credit_card, paypal
- **Relationships**:
  - Many-to-One with Invoices (CASCADE delete)
  - Many-to-One with Users (SET NULL on delete)

### **Key Database Features**

- **Referential Integrity**: All foreign key relationships are properly defined
- **Cascade Operations**: Related records are automatically managed on parent deletion
- **Data Validation**: Entity-level validation using class-validator decorators
- **Timestamps**: Automatic creation and update timestamps on relevant entities
- **Decimal Precision**: Financial amounts stored with 12,2 precision for accuracy

</details>
