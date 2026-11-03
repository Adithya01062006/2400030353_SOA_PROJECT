# Building SubTrack – A Service-Oriented Architecture (SOA) Subscription Lifecycle & Recurring Revenue Management Platform

**PROJECT NAME**: SubTrack  
**FULL TITLE**: SubTrack – Subscription Lifecycle & Recurring Revenue Management System  

```text
==================================================
ACADEMIC & PROJECT TEAM DETAILS
==================================================
University:  [ PLACEHOLDER: e.g. KL University / SRM / Amrita ]
Department:  [ PLACEHOLDER: Department of Computer Science & Engineering ]
Year/Sec:    [ PLACEHOLDER: B.Tech CSE 3rd Year / Sec A ]
Team Name:   [ PLACEHOLDER: SubTrack Innovators ]
Team Lead:   [ PLACEHOLDER: Student Name / Reg No ]
Team Members:[ PLACEHOLDER: Member 1, Member 2, Member 3 ]
==================================================
```

---

## Executive Summary
In today's digital economy, subscription management systems must be resilient, scalable, and secure. As part of our **B.Tech CSE SOA Project (Project Review-1)**, our team engineered **SubTrack**—a microservices-based subscription lifecycle and recurring revenue platform powered by Spring Boot, Spring Cloud, OpenFeign, JWT Security, MySQL, and React + Vite.

---

## 1. Problem Analysis & Proposed Solution
Subscription platforms frequently suffer from monolithic bottlenecks during billing spikes and lack automated state management for renewals and cancellations. **SubTrack** solves this by decomposing the system into 5 dedicated microservices:
1. **Eureka Server**: Centralized service discovery on port `8761`.
2. **API Gateway**: Reverse proxy and CORS handler on port `8080`.
3. **User / Auth Service**: BCrypt password hashing & JWT authentication on port `8081`.
4. **Subscription Service**: Main business domain handling plan activation, renewal, cancellation, and `@Scheduled` automated expiry detection on port `8082`.
5. **Payment Service**: Mock payment processing engine logging transaction references (`TXN-...`) on port `8083`.

---

## 2. Key Microservice Features & Innovations

- **Declarative Inter-Service Communication**: Subscription Service communicates with Payment Service dynamically over **OpenFeign** using Eureka service names (`PAYMENT-SERVICE`).
- **Stateless JWT Security**: Passwords are securely salted using BCrypt; HMAC-SHA256 JWT tokens authenticate user requests across protected endpoints.
- **Automated Expiry Scheduler**: Background task detects passed expiration dates and updates state from `ACTIVE` to `EXPIRED` automatically.
- **Modern Glassmorphic React UI**: Designed with clean status badges (`ACTIVE`, `EXPIRED`, `CANCELLED`), responsive action buttons, and advance pre-expiry alert banners.

---

## 3. Technology Stack Overview

- **Backend**: Java 21 LTS, Spring Boot 3.2.5, Spring Data JPA, Spring Security, Spring Cloud Gateway, Spring Cloud Netflix Eureka, OpenFeign.
- **Frontend**: React 18, Vite, Axios, Lucide Icons, Glassmorphism CSS Design System.
- **Databases**: MySQL / H2 relational databases.
- **Build & Tools**: Apache Maven 3.9.12, Git, Docker & Docker Compose.

---

## Conclusion & Future Scope
SubTrack demonstrates a production-grade SOA architecture suitable for modern SaaS billing systems. Future enhancements will include multi-currency support, WebHook notifications, and automated recurring billing webhooks.
