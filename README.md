# 🏥 TeleMed EHR — Telemedicine & Electronic Health Records Platform

> A secure, cryptographically compliant, full-stack Telemedicine and EHR platform enabling algorithmic appointment scheduling, peer-to-peer encrypted video consultations, encrypted patient history management, and automated verifiable prescription generation.

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Key Performance Indicators](#key-performance-indicators)
- [User Personas](#user-personas)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Cryptographic Algorithms](#cryptographic-algorithms)
- [API Documentation](#api-documentation)
- [Security & Compliance](#security--compliance)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Executive Summary

The global healthcare sector is shifting toward decentralized, digital-first patient care. Traditional EHR systems inhibit data portability and interoperability, while consumer-grade video tools fail to meet stringent HIPAA-analog data privacy and encryption regulations.

**TeleMed EHR** solves this by delivering an end-to-end engineered platform that provides:
- Military-grade **AES-256** encryption for all Protected Health Information (PHI) at rest.
- **WebRTC** peer-to-peer encrypted video channels — no plugins required.
- An algorithmic **collision-detection scheduling engine** that prevents double-booking.
- **Cryptographically signed, verifiable PDF prescriptions** with embedded QR codes.

---

## Key Performance Indicators

| KPI | Target |
|---|---|
| System Uptime | ≥ 99.8% |
| WebRTC Connection Establishment | < 3 seconds |
| Automated Vulnerability Scan | Zero critical flaws |
| PHI Encryption Coverage | 100% of sensitive fields |
| Audit Log Coverage | 100% of PHI read/write operations |

---

## User Personas

| Persona | Primary Needs | Core Workflows |
|---|---|---|
| **Patient** | Appointment booking, secure medical history access, low-latency video | Books slots, uploads diagnostic reports, joins WebRTC rooms via encrypted tokens, downloads verifiable prescriptions |
| **Medical Practitioner** | Schedule management, patient history retrieval, clinical note-taking | Approves appointments, reviews patient data, conducts HD video consultations, generates cryptographic prescriptions |
| **Clinic Administrator** | System management, compliance oversight, billing/insurance tracking | Manages doctor rosters, oversees access logs, extracts anonymized clinical analytics |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│          React + TypeScript + Material-UI (SPA)                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────────┐
│                      BACKEND API LAYER                          │
│              Node.js + Express.js (REST API)                    │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ JWT AuthMW  │  │ AES-256 EncMW│  │  Audit Log Middleware │  │
│   └─────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────┬────────────────────────────────────┬─────────────────┘
           │                                    │
┌──────────▼──────────┐             ┌───────────▼─────────────────┐
│   PRIMARY DATABASE  │             │    SIGNALING MICROSERVICE    │
│  MongoDB (Mongoose) │             │   Node.js + Socket.io        │
│  AES-256 Field-Level│             │  (SDP & ICE Candidate Relay) │
│  Encryption         │             └───────────┬─────────────────┘
└─────────────────────┘                         │ WebRTC P2P
                                    ┌───────────▼─────────────────┐
                                    │   PEER-TO-PEER VIDEO LAYER  │
                                    │     WebRTC (Browser API)    │
                                    └─────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | React, TypeScript, Material-UI | TypeScript enforces rigid data structures when parsing and transmitting complex medical data payloads |
| **Backend API** | Node.js, Express.js | Middleware support for authentication, audit logging, and error handling |
| **Database** | MongoDB (Mongoose) | NoSQL JSON-like format perfectly matched for the JavaScript ecosystem |
| **Video Infrastructure** | WebRTC + Socket.io | Low-latency P2P encrypted streams; Socket.io handles SDP signaling through firewalls |
| **Security & Auditing** | JWT, AES-256, Audit Logging Middleware | Guarantees all PHI is encrypted and every system action is immutably logged for regulatory compliance |
| **PDF Generation** | PDFKit (Node.js) | Generates highly formatted, professional PDF prescriptions with cryptographic hash/QR codes |
| **Containerization** | Docker | Ensures consistent, reproducible environments across development and production |
| **CI/CD & Security** | GitHub Advanced Security, Dependabot | Static code analysis and dependency vulnerability scanning |

---

## Features

### 🔐 Security & Compliance
- JWT-based stateless authentication with role-based access control (Patient / Practitioner / Admin)
- AES-256 field-level encryption on all PHI fields before database insertion
- Immutable Audit Logging Middleware capturing timestamp, user ID, IP address, and action descriptor for every PHI read/write
- Cryptographically secure room tokens for telehealth sessions (time-locked to exact appointment)

### 📅 Smart Scheduling Engine
- Algorithmic **collision-detection**: mathematically verifies doctor availability before confirming any appointment
- Overlap check against all existing intervals for a given doctor — rejects payloads where temporal collisions exist
- Time-zone conversion handling
- Automated email/SMS reminders via external service integration

### 🎥 Encrypted Telehealth Rooms
- WebRTC peer-to-peer audio/video — operates strictly within the browser (no plugins)
- Dedicated Socket.io signaling microservice for SDP payload and ICE candidate exchange
- Graceful degradation on network drops or peer connection failures
- Consultation rooms accessible only via cryptographically secure, time-locked tokens

### 📄 Digital Prescription Generator
- Physicians input pharmacological details via structured clinical interface
- PDFKit generates professional, formatted PDF prescriptions
- Each prescription contains an embedded **cryptographic hash + QR code** for pharmacy-side authenticity verification
- PDFs are standardized and unalterable post-generation

### 📊 EHR Module
- Longitudinal patient records: demographics, vital signs, allergy histories, chronological diagnoses
- Secure upload and retrieval of previous diagnostic reports
- Input validation via **Zod schemas** preventing NoSQL injection and XSS attacks
- Full CRUD API with strict schema enforcement

---

## Project Structure

```
telemed-ehr/
├── client/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── dashboard/          # Role-based dashboards
│   │   │   ├── ehr/                # EHR record views & forms
│   │   │   ├── scheduling/         # Calendar & appointment UI
│   │   │   ├── consultation/       # WebRTC consultation room
│   │   │   └── prescriptions/      # Prescription viewer/downloader
│   │   ├── services/               # API service layer (Axios)
│   │   ├── hooks/                  # Custom React hooks (useWebRTC, etc.)
│   │   ├── store/                  # State management
│   │   ├── types/                  # TypeScript interfaces & types
│   │   └── utils/                  # Helper functions
│   └── package.json
│
├── server/                         # Node.js + Express.js backend
│   ├── src/
│   │   ├── config/                 # DB connection, environment config
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── Patient.model.ts
│   │   │   ├── Doctor.model.ts
│   │   │   ├── Appointment.model.ts
│   │   │   ├── MedicalRecord.model.ts
│   │   │   └── Prescription.model.ts
│   │   ├── middleware/             # Auth, AES encryption, audit logger
│   │   ├── routes/                 # API route definitions
│   │   ├── controllers/            # Business logic controllers
│   │   ├── services/               # Scheduling engine, PDF generator, crypto
│   │   └── utils/                  # Token generation, hash utilities
│   └── package.json
│
├── signaling-server/               # Socket.io signaling microservice
│   ├── src/
│   │   ├── index.ts                # Socket.io server entrypoint
│   │   └── handlers/               # SDP & ICE candidate event handlers
│   └── package.json
│
├── docker-compose.yml              # Multi-service orchestration
├── .github/
│   ├── workflows/                  # CI/CD pipelines
│   └── dependabot.yml              # Dependency vulnerability scanning
└── README.md
```

---

## Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- **MongoDB** v6.x (local instance or MongoDB Atlas URI)
- **Docker** & **Docker Compose** (for containerized setup)
- A modern browser supporting WebRTC (Chrome 90+, Firefox 88+, Edge 90+)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/telemed-ehr.git
cd telemed-ehr
```

### 2. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install

# Signaling Server
cd ../signaling-server && npm install
```

### 3. Configure Environment Variables

Copy the example env files and fill in your values (see [Environment Variables](#environment-variables)):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp signaling-server/.env.example signaling-server/.env
```

### 4. Start Services (Development)

```bash
# Terminal 1 — Backend API
cd server && npm run dev

# Terminal 2 — Signaling Microservice
cd signaling-server && npm run dev

# Terminal 3 — Frontend
cd client && npm start
```

### 5. Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Signaling Server | http://localhost:4000 |
| MongoDB | mongodb://localhost:27017 |

---

## Environment Variables

### `server/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/telemed_ehr

# JWT
JWT_SECRET=<your_256_bit_secret>
JWT_EXPIRES_IN=8h

# AES-256 Encryption
AES_ENCRYPTION_KEY=<your_32_byte_hex_key>
AES_IV_LENGTH=16

# Email / SMS (for appointment reminders)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<your_email>
SMTP_PASS=<your_password>

# PDF Prescription
PDF_SIGNING_SECRET=<your_hmac_secret>
```

### `client/.env`

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SIGNALING_URL=http://localhost:4000
```

### `signaling-server/.env`

```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=<same_as_server_jwt_secret>
```

---

## Cryptographic Algorithms

| Purpose | Algorithm | Details |
|---|---|---|
| PHI Field Encryption (at rest) | **AES-256-CBC** | Applied at Mongoose model layer before database write; IV stored alongside ciphertext |
| Data in Transit | **TLS 1.3** | All HTTP and WebSocket traffic over HTTPS/WSS |
| Authentication Tokens | **JWT (HS256)** | Signed with a 256-bit secret; short-lived (8h) |
| Telehealth Room Tokens | **HMAC-SHA256** | Time-locked, cryptographically secure, single-use per appointment slot |
| Prescription Authenticity | **HMAC-SHA256 + QR Code** | Hash of prescription payload embedded as QR; verifiable by pharmacies |
| WebRTC Media Streams | **DTLS-SRTP** (browser-native) | Peer-to-peer stream encryption handled natively by the WebRTC API |
| Password Hashing | **bcrypt** (cost factor 12) | Applied to all user passwords before storage |

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive JWT |

### EHR Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/records/:patientId` | Retrieve patient medical records |
| POST | `/api/records` | Create new medical record entry |
| PUT | `/api/records/:id` | Update a medical record |
| DELETE | `/api/records/:id` | Soft-delete a medical record |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List appointments (filtered by role) |
| POST | `/api/appointments` | Create appointment (runs collision check) |
| PUT | `/api/appointments/:id/approve` | Practitioner approves appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |

### Telehealth
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/telehealth/token/:appointmentId` | Generate secure room token (time-locked) |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/prescriptions` | Generate and sign a new PDF prescription |
| GET | `/api/prescriptions/:id/download` | Download verified PDF prescription |
| GET | `/api/prescriptions/verify/:hash` | Public endpoint — pharmacy verification |

---

## Security & Compliance

- **Static Code Analysis**: GitHub Advanced Security (CodeQL) runs on every pull request.
- **Dependency Scanning**: Dependabot monitors all dependencies for CVEs continuously.
- **Branch Protection**: All merges to `main` require at least one peer-approved code review.
- **Audit Logs**: Every PHI access is logged with `{ timestamp, userId, ipAddress, action, resourceId }` and stored immutably.
- **Zero-Trust API Design**: Every protected endpoint validates JWT and re-authorizes role before execution.

---

## Deployment

### Docker Build & Push

```bash
docker build -t telemed-ehr-server ./server
docker build -t telemed-ehr-client ./client
docker build -t telemed-ehr-signaling ./signaling-server
```

### Production docker-compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

The production compose file configures:
- Environment variable injection from secrets manager
- MongoDB with persistent volumes
- Nginx reverse proxy with SSL termination
- Health checks for all services

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "feat: describe your change"`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a Pull Request — peer review is **mandatory** before merge

> All contributors must adhere to the branch protection rules. No direct pushes to `main`.

---

*Built with ❤️ for secure, accessible digital healthcare.*
