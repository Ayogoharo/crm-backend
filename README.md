# CRM Backend API

## Overview

This is a simple Customer Relationship Management (CRM) backend application. The system provides simple CRUD functionality for managing clients, leads, invoices, payments, and users with role-based access control. Built using **NestJS** framework with **TypeScript**, **TypeORM** for database management, **PostgreSQL** as the primary database, **Redis** for caching, and **Docker** for containerization. The application follows RESTful API principles, error handling, and database relations.

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

   # Redis Configuration
   REDIS_PASSWORD=your_redis_password

   # Application Environment
   NODE_ENV=development
   ```

4. **Start database services**

   ```bash
   docker-compose up -d
   ```

5. **Build the application**

   ```bash
   npm run build
   ```

6. **Run database migrations**

   ```bash
   npx typeorm migration:run -d ./dist/data-source.js
   ```

7. **Start the application**
   ```bash
   # Development mode only
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

<details>
<summary><strong>📚 API Endpoints</strong></summary>

### Users Management

- **POST** `/users` - Create new user
  ```json
  {
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123",
    "fullName": "John Doe",
    "role": "admin" // admin | sales | accountant
  }
  ```
- **GET** `/users` - Get all users
- **GET** `/users/:id` - Get user by ID
- **PUT** `/users` - Update user
- **DELETE** `/users/:id` - Delete user

### Clients Management

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
- **PUT** `/clients` - Update client
- **DELETE** `/clients/:id` - Delete client
- **GET** `/clients/total/:id` - Get client invoice total

### Leads Management

- **POST** `/leads` - Create new lead
  ```json
  {
    "clientId": 1,
    "ownerId": 1,
    "status": "new", // new | contacted | qualified | won | lost
    "source": "website",
    "notes": "Interested in our premium package"
  }
  ```
- **GET** `/leads` - Get all leads (supports filtering by userId and status)
- **GET** `/leads/:id` - Get lead by ID
- **PUT** `/leads/:id` - Update lead
- **DELETE** `/leads/:id` - Delete lead

### Invoices Management

- **POST** `/invoices` - Create new invoice
  ```json
  {
    "clientId": 1,
    "issuedBy": 1,
    "invoiceDate": "2024-01-15",
    "dueDate": "2024-02-15",
    "status": "draft", // draft | sent | paid | overdue | cancelled
    "totalAmount": 1500.0
  }
  ```
- **GET** `/invoices` - Get all invoices (supports filtering by status)
- **GET** `/invoices/:id` - Get invoice by ID
- **PUT** `/invoices` - Update invoice
- **DELETE** `/invoices/:id` - Delete invoice

### Invoice Items Management

- **POST** `/invoice-items` - Create new invoice item
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
- **PUT** `/invoice-items` - Update invoice item
- **DELETE** `/invoice-items/:id` - Delete invoice item

### Payments Management

- **POST** `/payments` - Create new payment
  ```json
  {
    "invoiceId": 1,
    "recordedBy": 1,
    "paymentDate": "2024-01-20",
    "amount": 1500.0,
    "method": "bank_transfer", // cash | bank_transfer | credit_card | paypal
    "reference": "TXN123456789"
  }
  ```
- **GET** `/payments` - Get all payments
- **GET** `/payments/:id` - Get payment by ID
- **PUT** `/payments` - Update payment
- **DELETE** `/payments/:id` - Delete payment

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
