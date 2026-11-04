# SubTrack – Full-Stack Subscription Lifecycle Management System [Backend Microservices & Frontend UI]

> **Course**: 24SDCS03A - Service-Oriented Architecture (SOA [Adv])  
> **Student ID**: 2400030353  
> **Developer**: Adithya  
> **Live Web Application (GitHub Pages)**: [https://adithya01062006.github.io/2400030353_SOA_PROJECT/](https://adithya01062006.github.io/2400030353_SOA_PROJECT/)  
> **Project Scope**: Full-Stack Architecture (Spring Cloud Backend Microservices + React Vite Frontend Client)  
> **Architecture Pattern**: Service-Oriented Architecture (SOA) / Microservices Architecture  
> **Backend Tech Stack**: Java 21, Spring Boot 3.2.5, Spring Cloud 2023.0.1 (Eureka, Spring Cloud Gateway, OpenFeign), JWT Security, MySQL 8.0, JUnit 5, Mockito  
> **Frontend Tech Stack**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Glassmorphic UI  

---

## 📌 Project Overview

**SubTrack** is an enterprise-grade full-stack subscription lifecycle and recurring revenue management platform designed following **Service-Oriented Architecture (SOA)** and **Microservices** best practices.

It provides a decoupled **Backend Microservices Ecosystem** integrated with a modern **React Frontend Single-Page Application (SPA)**, handling:
- Recurring billing plans & subscriptions catalog
- User authentication & Role-Based Access Control (RBAC) with JWT & BCrypt
- Automated subscription renewals & cancellations
- Mock payment processing with transaction references (`TXN-`)
- Automated invoice generation (`INV-`)
- Scheduled expiry detection workers
- Real-time in-app notification & alert dispatching

---

## 🏗️ System Architecture: Frontend & Backend Separation

```text
                                  ┌────────────────────────────────┐
                                  │      FRONTEND APPLICATION      │
                                  │     React 18 + Vite (5173)     │
                                  │  Glassmorphic Dashboard & UI   │
                                  └───────────────┬────────────────┘
                                                  │ HTTP / REST (Axios with Bearer Token)
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │      SPRING CLOUD GATEWAY      │
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

## 📂 Repository Structure (Frontend & Backend Clearly Separated)

```text
2400030353_SOA_PROJECT/
├── .gitignore                      # Git ignore rules for Maven & Node.js
├── README.md                       # Comprehensive Full-Stack Documentation
├── docker-compose.yml              # Container orchestration for all microservices
├── pom.xml                         # Root Maven parent POM multi-module aggregator
│
├── ⚙️ backend/                     # BACKEND MICROSERVICES DIRECTORY
│   ├── pom.xml                     # Backend multi-module aggregator POM
│   ├── eureka-server/              # Netflix Eureka Service Discovery (Port: 8761)
│   ├── api-gateway/                # Spring Cloud API Gateway with JWT & RBAC (Port: 8080)
│   ├── user-service/               # Authentication, Users, BCrypt & JWT (Port: 8081)
│   ├── subscription-service/       # Plan catalog, Subscriptions, Expiry Scheduler (Port: 8082)
│   ├── payment-service/            # Mock Payment Processing & Invoices (Port: 8083)
│   └── notification-service/       # In-App Notifications & Expiry Alerts (Port: 8084)
│
├── 🖥️ frontend/                    # FRONTEND WEB APPLICATION (React 18 + Vite)
│   ├── src/
│   │   ├── api/                    # Axios instance with JWT Authorization interceptor
│   │   ├── components/             # Glassmorphic UI components, Modals, Navbar, Badges
│   │   ├── context/                # Authentication & Theme Context Providers
│   │   ├── pages/                  # User Dashboard, Admin Dashboard, Plans, Subscriptions
│   │   └── App.jsx                 # Main Router & Application Root
│   ├── package.json                # Node.js dependencies
│   └── vite.config.js              # Vite configuration
│
└── 📖 docs/                        # Architecture diagrams, API specs, and test reports
```

---

## ⚙️ Backend Microservices Matrix

| Microservice | Port | Service ID | Database Schema | Key Responsibilities |
| :--- | :---: | :--- | :--- | :--- |
| **Eureka Server** | `8761` | `eureka-server` | — | Centralized service discovery, heartbeat registration & lookup |
| **API Gateway** | `8080` | `api-gateway` | — | Single entry point, global CORS, JWT AuthenticationFilter, RBAC |
| **User Service** | `8081` | `USER-SERVICE` | `subtrack_user_db` | Registration, BCrypt password hashing, JWT issue & `/validate` |
| **Subscription Service** | `8082` | `SUBSCRIPTION-SERVICE` | `subtrack_subscription_db` | Plan management, lifecycle (`ACTIVE`, `EXPIRED`, `CANCELLED`), `@Scheduled` expiry |
| **Payment Service** | `8083` | `PAYMENT-SERVICE` | `subtrack_payment_db` | Mock payment processing (`TXN-`), automated invoice generation (`INV-`) |
| **Notification Service** | `8084` | `NOTIFICATION-SERVICE` | `subtrack_notification_db` | Automated expiry alerts, user notifications, Admin broadcasts via Feign |

---

## 🖥️ Frontend Web Application Features

- **Built with**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Port**: `5173`
- **Dashboard**: Real-time view of active subscriptions, total expenditure, and upcoming renewal alerts
- **Interactive Plans**: One-click subscription activation with instant mock payment confirmation
- **Invoices**: Searchable billing history with instant modal preview
- **Notification Bell**: Live unread counter and notification center with mark-all-read
- **Admin Console**: Dedicated panels to create/update plans and broadcast system alerts
- **Authentication**: JWT auto-stored in LocalStorage with automatic Axios request interceptors

---

## 🛠️ Prerequisites & Setup

### Prerequisites
- **Java**: 21 LTS (`java -version`)
- **Maven**: 3.9+ (`mvn -v`)
- **Node.js**: 18+ & npm (`node -v`, `npm -v`)
- **MySQL**: 8.0 running on `localhost:3306`

### MySQL Database Setup
The backend services automatically create their required databases upon startup:
```sql
CREATE DATABASE IF NOT EXISTS subtrack_user_db;
CREATE DATABASE IF NOT EXISTS subtrack_subscription_db;
CREATE DATABASE IF NOT EXISTS subtrack_payment_db;
CREATE DATABASE IF NOT EXISTS subtrack_notification_db;
```

---

## 🚀 How to Run the Project (Backend & Frontend)

### 🅰️ Step 1: Build All Backend Microservices (Maven)
From the root directory:
```bash
mvn clean package -DskipTests
```

### 🅱️ Step 2: Start Backend Services in Order

1. **Eureka Server**:
   ```bash
   cd backend/eureka-server
   java -jar target/subtrack-eureka-server-0.0.1-SNAPSHOT.jar
   # Accessible at http://localhost:8761
   ```

2. **User Service**:
   ```bash
   cd backend/user-service
   java -jar target/subtrack-user-service-0.0.1-SNAPSHOT.jar
   # Runs on port 8081
   ```

3. **Payment Service**:
   ```bash
   cd backend/payment-service
   java -jar target/subtrack-payment-service-0.0.1-SNAPSHOT.jar
   # Runs on port 8083
   ```

4. **Subscription Service**:
   ```bash
   cd backend/subscription-service
   java -jar target/subtrack-subscription-service-0.0.1-SNAPSHOT.jar
   # Runs on port 8082
   ```

5. **Notification Service**:
   ```bash
   cd backend/notification-service
   java -jar target/subtrack-notification-service-0.0.1-SNAPSHOT.jar
   # Runs on port 8084
   ```

6. **API Gateway**:
   ```bash
   cd backend/api-gateway
   java -jar target/subtrack-api-gateway-0.0.1-SNAPSHOT.jar
   # Runs on port 8080 (Single Gateway Endpoint)
   ```

### 🅲 Step 3: Start Frontend Client

```bash
cd frontend
npm install
npm run dev
# Open UI in browser at http://localhost:5173
```

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@subtrack.com` | `admin123` |
| **Regular User** | `user@subtrack.com` | `user123` |

---

## 📡 Postman & REST API Documentation (Backend Gateway: `http://localhost:8080`)

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

## 🧪 Automated Testing & Verification

Comprehensive test suites cover positive, negative, and edge cases across every service:

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
- **Developer**: Adithya
- **GitHub Repository**: [https://github.com/Adithya01062006/2400030353_SOA_PROJECT](https://github.com/Adithya01062006/2400030353_SOA_PROJECT)
- **Course**: 24SDCS03A - Service-Oriented Architecture (SOA [Adv])
