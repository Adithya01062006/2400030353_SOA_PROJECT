# SubTrack – Subscription Lifecycle & Recurring Revenue Management System

> **Course**: 24SDCS03A - Service-Oriented Architecture (SOA [Adv])  
> **Student ID**: 2400030353  
> **Developer**: Adithya  
> **Architecture Pattern**: Service-Oriented Architecture (SOA) / Microservices Architecture  
> **Tech Stack**: Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.1 (Eureka, Gateway, OpenFeign), JWT Security, MySQL 8.0, React 18, Vite  

---

## 📌 Project Overview

**SubTrack** is an enterprise-grade subscription lifecycle and recurring revenue management platform designed following **Service-Oriented Architecture (SOA)** and **Microservices** best practices.

It handles recurring billing plans, user registration & JWT security, automated subscription renewals, payment simulation with unique transaction references, invoice generation, automated expiry schedulers, and real-time in-app notifications.

---

## 🏗️ System Architecture & Separation

The project is structured with a clean separation between **Backend Microservices** and the **Frontend Client Application**:

```text
                                  ┌────────────────────────────────┐
                                  │       Frontend Application     │
                                  │      React 18 + Vite (5173)    │
                                  └───────────────┬────────────────┘
                                                  │ HTTP (Axios / JWT)
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │      Spring Cloud Gateway      │
                                  │    Single Entry Point (8080)   │
                                  │  JWT Validation & RBAC Filters │
                                  └───────────────┬────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
       ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
       │   USER-SERVICE    │            │SUBSCRIPTION-SERVICE│           │  PAYMENT-SERVICE  │
       │    (Port 8081)    │            │    (Port 8082)    │            │    (Port 8083)    │
       │  JWT Auth & BCrypt│            │Plans & Sub Manager│            │Payments & Invoices│
       └─────────┬─────────┘            └─────────┬─────────┘            └─────────┬─────────┘
                 │                                │                                │
                 ▼                                ▼                                ▼
          subtrack_user_db             subtrack_subscription_db         subtrack_payment_db
                                                  │                                │
                                                  └───(OpenFeign Call: Process)────┘
                                                  
                 ┌────────────────────────────────┬────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                │
       ┌───────────────────┐            ┌───────────────────┐                      │
       │NOTIFICATION-SERVICE            │   EUREKA SERVER   │                      │
       │    (Port 8084)    │            │ Service Discovery │                      │
       │ Expiry & Broadcast│            │    (Port 8761)    │                      │
       └─────────┬─────────┘            └───────────────────┘                      │
                 │                                                                 │
                 ▼                                                                 │
     subtrack_notification_db                                                      │
                 ▲                                                                 │
                 └──────────────(OpenFeign Calls: Users & Subs)────────────────────┘
```

---

## 📂 Repository Structure

```text
2400030353_SOA_PROJECT/
├── .gitignore                      # Git ignore rules for Maven & Node.js
├── README.md                       # Comprehensive Project Documentation
├── docker-compose.yml              # Container orchestration for all microservices
├── pom.xml                         # Root Maven parent POM multi-module aggregator
│
├── [BACKEND SERVICES]
│   ├── eureka-server/              # Netflix Eureka Service Discovery (Port: 8761)
│   ├── api-gateway/                # Spring Cloud API Gateway with JWT & RBAC (Port: 8080)
│   ├── user-service/               # Authentication, Users, BCrypt & JWT (Port: 8081)
│   ├── subscription-service/       # Plan catalog, Subscriptions, Expiry Scheduler (Port: 8082)
│   ├── payment-service/            # Mock Payment Processing & Invoices (Port: 8083)
│   └── notification-service/       # In-App Notifications & Expiry Alerts (Port: 8084)
│
├── [FRONTEND CLIENT]
│   └── frontend/                   # Modern React 18 + Vite User & Admin Interface (Port: 5173)
│       ├── src/
│       │   ├── api/                # Axios instance with JWT Authorization interceptor
│       │   ├── components/         # Glassmorphic UI components, Modals, Navbar, Badges
│       │   ├── context/            # Authentication & Theme Context Providers
│       │   ├── pages/              # User Dashboard, Admin Dashboard, Plans, Subscriptions
│       │   └── App.jsx             # Main Router & Application Root
│       ├── package.json            # Node.js dependencies
│       └── vite.config.js          # Vite configuration
│
└── docs/                           # Architecture diagrams, API specs, and test reports
```

---

## ⚙️ Microservices Matrix

| Component | Port | Service ID | Database | Key Responsibilities |
| :--- | :---: | :--- | :--- | :--- |
| **Eureka Server** | `8761` | `eureka-server` | — | Centralized service registry & heartbeat lookup |
| **API Gateway** | `8080` | `api-gateway` | — | Single reverse-proxy entry point, CORS, JWT AuthFilter, RBAC |
| **User Service** | `8081` | `USER-SERVICE` | `subtrack_user_db` | Registration, BCrypt password hashing, JWT token issue & validation |
| **Subscription Service** | `8082` | `SUBSCRIPTION-SERVICE` | `subtrack_subscription_db` | Plan management, lifecycle (`ACTIVE`, `EXPIRED`, `CANCELLED`), `@Scheduled` expiry |
| **Payment Service** | `8083` | `PAYMENT-SERVICE` | `subtrack_payment_db` | Mock payment processing (`TXN-`), automated invoice generation (`INV-`) |
| **Notification Service** | `8084` | `NOTIFICATION-SERVICE` | `subtrack_notification_db` | Automated expiry alerts, user notifications, Admin broadcasts via Feign |
| **Frontend UI** | `5173` | `subtrack-frontend` | Client LocalStorage | Responsive, glassmorphic UI for Users & Admins with live dashboards |

---

## 🛠️ Prerequisites & Setup

### Prerequisites
- **Java**: 21 LTS (`java -version`)
- **Maven**: 3.9+ (`mvn -v`)
- **Node.js**: 18+ & npm (`node -v`, `npm -v`)
- **MySQL**: 8.0 running on `localhost:3306`

### Database Setup
The services automatically create the databases if they do not exist:
```sql
CREATE DATABASE IF NOT EXISTS subtrack_user_db;
CREATE DATABASE IF NOT EXISTS subtrack_subscription_db;
CREATE DATABASE IF NOT EXISTS subtrack_payment_db;
CREATE DATABASE IF NOT EXISTS subtrack_notification_db;
```

---

## 🚀 How to Run the Project

### 1. Build All Microservices (Maven)
From the project root:
```bash
mvn clean package -DskipTests
```

### 2. Start Services in Order

#### Step 1: Start Eureka Server
```bash
cd eureka-server
java -jar target/subtrack-eureka-server-0.0.1-SNAPSHOT.jar
# Access Dashboard at http://localhost:8761
```

#### Step 2: Start User Service
```bash
cd user-service
java -jar target/subtrack-user-service-0.0.1-SNAPSHOT.jar
# Runs on port 8081
```

#### Step 3: Start Payment Service
```bash
cd payment-service
java -jar target/subtrack-payment-service-0.0.1-SNAPSHOT.jar
# Runs on port 8083
```

#### Step 4: Start Subscription Service
```bash
cd subscription-service
java -jar target/subtrack-subscription-service-0.0.1-SNAPSHOT.jar
# Runs on port 8082
```

#### Step 5: Start Notification Service
```bash
cd notification-service
java -jar target/subtrack-notification-service-0.0.1-SNAPSHOT.jar
# Runs on port 8084
```

#### Step 6: Start API Gateway
```bash
cd api-gateway
java -jar target/subtrack-api-gateway-0.0.1-SNAPSHOT.jar
# Entry point on port 8080
```

#### Step 7: Start Frontend Client
```bash
cd frontend
npm install
npm run dev
# Access UI at http://localhost:5173
```

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@subtrack.com` | `admin123` |
| **Regular User** | `user@subtrack.com` | `user123` |

---

## 📡 Postman & REST API Documentation

All API calls are routed through the **API Gateway** (`http://localhost:8080`).

### 1. Authentication (`/api/users`)
- `POST /api/users/register` – Register new user
- `POST /api/users/login` – Login and obtain JWT Bearer token
- `GET /api/users` – Get all users (*Requires ADMIN role*)
- `GET /api/users/{id}` – Get user details by ID
- `GET /api/users/validate` – Validate JWT token

### 2. Subscription Plans (`/api/plans`)
- `GET /api/plans` – Get all active plans (Public)
- `GET /api/plans/all` – Get all plans including inactive (*ADMIN*)
- `GET /api/plans/{id}` – Get plan by ID
- `POST /api/plans` – Create new plan (*ADMIN*)
- `PUT /api/plans/{id}` – Update plan (*ADMIN*)
- `DELETE /api/plans/{id}` – Delete plan (*ADMIN*)

### 3. Subscriptions (`/api/subscriptions`)
- `POST /api/subscriptions/activate` – Activate subscription with payment
- `GET /api/subscriptions` – Get all subscriptions
- `GET /api/subscriptions/{id}` – Get subscription details
- `GET /api/subscriptions/user/{userId}` – Get user's subscriptions
- `PUT /api/subscriptions/{id}/renew` – Renew subscription
- `PUT /api/subscriptions/{id}/cancel` – Cancel subscription

### 4. Payments & Invoices (`/api/payments`)
- `POST /api/payments/process` – Process mock payment (Generates `TXN-` and `INV-`)
- `GET /api/payments` – Get all payments
- `GET /api/payments/{id}` – Get payment by ID
- `GET /api/payments/user/{userId}` – Get payments by user
- `GET /api/payments/invoices` – Get all invoices
- `GET /api/payments/invoices/{id}` – Get invoice by ID
- `GET /api/payments/invoices/user/{userId}` – Get invoices by user

### 5. Notifications (`/api/notifications`)
- `GET /api/notifications/user/{userId}` – Get user's notifications
- `GET /api/notifications/unread-count/{userId}` – Get unread count
- `PUT /api/notifications/{id}/read` – Mark notification as read
- `PUT /api/notifications/user/{userId}/read-all` – Mark all as read
- `POST /api/notifications/admin/send` – Admin send / broadcast (*ADMIN*)
- `POST /api/notifications/process-expiry` – Trigger automated expiry scan

---

## 🧪 Automated Testing & Validation

All microservices have complete positive and negative test coverage using JUnit 5, Mockito, and Spring MockMvc:

```bash
mvn test
```

**Results**:
- `subtrack-user-service`: 20 Tests Passed (0 Failures, 0 Errors)
- `subtrack-payment-service`: 15 Tests Passed (0 Failures, 0 Errors)
- `subtrack-subscription-service`: 23 Tests Passed (0 Failures, 0 Errors)
- `subtrack-notification-service`: 11 Tests Passed (0 Failures, 0 Errors)
- `subtrack-api-gateway`: 4 Tests Passed (0 Failures, 0 Errors)
- **Total: 73 Tests Passed (100% Pass Rate)**

---

## 👨‍💻 Author & Project Details

- **Student ID**: 2400030353
- **Name**: Adithya
- **GitHub Repository**: [https://github.com/Adithya01062006/2400030353_SOA_PROJECT](https://github.com/Adithya01062006/2400030353_SOA_PROJECT)
- **Course**: 24SDCS03A - Service-Oriented Architecture (SOA [Adv])
