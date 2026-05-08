# 🗓️ TeleMed EHR — Implementation Plan (4-Week Engineering Roadmap)

> This document is your step-by-step engineering guide. Follow each task sequentially within each week. Check off items as you complete them.

---

## 📐 Before You Start — One-Time Setup

- [ ] Create a **GitHub repository** with branch protection rules
  - Require pull request reviews before merging to `main`
  - Disable direct pushes to `main`
  - Enable **GitHub Advanced Security** (CodeQL) and **Dependabot**
- [ ] Initialize monorepo folder structure: `client/`, `server/`, `signaling-server/`
- [ ] Create `.env.example` files for all three services
- [ ] Set up `docker-compose.yml` skeleton (to be completed in Week 4)
- [ ] Initialize `README.md`

---

## ✅ WEEK 1 — Compliance Architecture, Schema Design & Cryptographic Foundations

**Goal:** Establish a bulletproof security foundation before writing a single business-logic line.

---

### 🗄️ Phase 1.1 — MongoDB Provisioning & NoSQL Schema Design

- [ ] Set up MongoDB locally (or provision a MongoDB Atlas cluster)
- [ ] Install Mongoose in the backend: `npm install mongoose`
- [ ] Design and implement the following **Mongoose schemas** in `server/src/models/`:

  **Patient.model.ts**
  ```
  Fields: fullName, dateOfBirth, gender, contactInfo (email, phone), address,
          emergencyContact, demographics, allergies[], vitalSigns[], diagnoses[]
  ```

  **Doctor.model.ts**
  ```
  Fields: fullName, specialization, licenseNumber, email, availabilitySlots[],
          workingHours { start, end }, department
  ```

  **Appointment.model.ts**
  ```
  Fields: patientId (ref), doctorId (ref), startTime, endTime, status
          (pending/approved/cancelled), roomToken, timezone, reminderSent
  ```

  **MedicalRecord.model.ts**
  ```
  Fields: patientId (ref), doctorId (ref), recordDate, chiefComplaint,
          clinicalNotes, diagnoses[], attachments[], vitalSigns {}
  ```

  **Prescription.model.ts**
  ```
  Fields: patientId (ref), doctorId (ref), appointmentId (ref),
          medications[{ name, dosage, frequency, duration }],
          issuedAt, pdfUrl, cryptoHash, qrCodeData, isVerified
  ```

- [ ] Create a `db.ts` config file and connect Mongoose to MongoDB on server start

---

### 🔒 Phase 1.2 — JWT Authentication System

- [ ] Install: `npm install jsonwebtoken bcrypt express-validator`
- [ ] Create `User.model.ts` with `role` enum: `['patient', 'doctor', 'admin']`
- [ ] Implement **bcrypt** password hashing (cost factor 12) in a pre-save Mongoose hook
- [ ] Build `POST /api/auth/register` — validates input, hashes password, saves user
- [ ] Build `POST /api/auth/login` — verifies credentials, returns signed JWT
- [ ] Create `authMiddleware.ts`:
  - Extracts Bearer token from `Authorization` header
  - Verifies JWT signature using `JWT_SECRET`
  - Attaches decoded `{ userId, role }` to `req.user`
- [ ] Create `roleGuard.ts` middleware — accepts allowed roles array, throws 403 if mismatch

---

### 🛡️ Phase 1.3 — AES-256 Field-Level Encryption

- [ ] Install: `npm install crypto` (built-in Node.js, no install needed)
- [ ] Create `server/src/utils/crypto.util.ts`:
  ```typescript
  // Implement two functions:
  encrypt(plainText: string): { iv: string, encryptedData: string }
  decrypt(iv: string, encryptedData: string): string
  // Use AES-256-CBC with key from AES_ENCRYPTION_KEY env variable
  ```
- [ ] Create a **Mongoose plugin** `encryptionPlugin.ts` that:
  - Accepts a list of field names to encrypt
  - On `pre('save')` hook: encrypts those fields
  - On `post('find'/'findOne')` hook: decrypts those fields
- [ ] Apply the encryption plugin to these **PHI fields** across models:
  - `Patient`: `fullName`, `dateOfBirth`, `contactInfo`, `allergies`, `diagnoses`
  - `MedicalRecord`: `clinicalNotes`, `diagnoses`, `vitalSigns`
  - `Prescription`: `medications`
- [ ] Write a unit test: save a Patient, read from raw MongoDB, confirm data is ciphertext

---

### 📝 Phase 1.4 — Audit Logging Middleware

- [ ] Create `server/src/middleware/auditLogger.ts`
- [ ] This Express middleware must intercept **every API request that touches PHI** and log:
  ```json
  {
    "timestamp": "ISO-8601",
    "userId": "from req.user",
    "ipAddress": "from req.ip",
    "method": "GET/POST/PUT/DELETE",
    "endpoint": "/api/records/:id",
    "resourceId": "patient or record ID",
    "action": "READ_MEDICAL_RECORD | UPDATE_PATIENT | etc."
  }
  ```
- [ ] Create `AuditLog.model.ts` — store logs in MongoDB (separate collection)
- [ ] Mark audit log documents as **immutable** (disable update/delete operations on this model)
- [ ] Apply `auditLogger` middleware to all `/api/records`, `/api/prescriptions`, `/api/patients` routes

---

### ✔️ Week 1 Completion Checklist
- [ ] All 5 Mongoose schemas created with proper field types and refs
- [ ] JWT register/login routes working and tested via Postman/Thunder Client
- [ ] `encrypt()` / `decrypt()` utility functions working correctly
- [ ] PHI fields confirmed as ciphertext in raw MongoDB
- [ ] Audit logs generated for every test API request

---

## ✅ WEEK 2 — EHR API Development & Algorithmic Scheduling Engine

**Goal:** Build the full data-access API and the collision-proof scheduling system.

---

### 📋 Phase 2.1 — EHR CRUD API with Input Validation

- [ ] Install: `npm install zod`
- [ ] Create **Zod schemas** for all incoming request bodies:
  - `createMedicalRecordSchema` — validate all required fields, types, and formats
  - `updateMedicalRecordSchema` — partial schema with at least one field required
  - `createPatientSchema` — validate demographics, contact info, etc.
- [ ] Create a reusable `validateRequest(schema)` middleware that:
  - Parses `req.body` through the Zod schema
  - Returns a structured `400` error with field-level messages on failure
  - Passes to `next()` only on success
- [ ] Build the **Medical Records API** in `server/src/routes/records.routes.ts`:
  - `GET /api/records/:patientId` — retrieves all records for a patient (doctor/admin only)
  - `POST /api/records` — creates a new record (doctor only)
  - `PUT /api/records/:id` — updates a specific record (doctor only)
  - `DELETE /api/records/:id` — soft-delete via `isArchived: true` flag (admin only)
- [ ] Build the **Patients API** in `server/src/routes/patients.routes.ts`:
  - `GET /api/patients/:id` — patient retrieves own record; doctor retrieves any
  - `PUT /api/patients/:id` — update patient profile
- [ ] Apply `authMiddleware` + `roleGuard` + `validateRequest` + `auditLogger` to all routes
- [ ] Test all endpoints — confirm Zod rejects malformed payloads (NoSQL injection strings, XSS scripts)

---

### 📅 Phase 2.2 — Smart Scheduling Engine (Collision Detection)

- [ ] Create `server/src/services/schedulingEngine.service.ts`
- [ ] Implement the **core collision-detection algorithm**:
  ```typescript
  async function checkForCollision(
    doctorId: string,
    proposedStart: Date,
    proposedEnd: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    // Query all non-cancelled appointments for the doctor
    // For each existing appointment [existingStart, existingEnd]:
    //   A collision exists if:
    //   proposedStart < existingEnd AND proposedEnd > existingStart
    // Return true if any collision found
  }
  ```
- [ ] Build the **Appointments API** in `server/src/routes/appointments.routes.ts`:
  - `GET /api/appointments` — role-filtered: patients see own, doctors see their schedule
  - `POST /api/appointments` — patient creates:
    1. Validate input (Zod)
    2. Run `checkForCollision()` — return `409 Conflict` if collision exists
    3. Convert submitted time to UTC (handle timezone)
    4. Save appointment with `status: 'pending'`
    5. Trigger email/SMS reminder scheduling
  - `PUT /api/appointments/:id/approve` — doctor approves (status → `'approved'`)
  - `DELETE /api/appointments/:id` — cancel (status → `'cancelled'`)
- [ ] Implement **timezone handling**: store all times in UTC, convert on read using the patient's timezone
- [ ] Set up email reminder service using Nodemailer (or similar):
  - Send confirmation email on appointment creation
  - Schedule reminder 24h before appointment

---

### ⚛️ Phase 2.3 — React Frontend Initialization & Integration

- [ ] Bootstrap React app: `npx create-react-app client --template typescript`
- [ ] Install: `npm install @mui/material @emotion/react @emotion/styled axios react-router-dom`
- [ ] Set up **React Router** with protected routes (redirect to login if no JWT)
- [ ] Create role-based routing:
  - `/dashboard/patient` — Patient Dashboard
  - `/dashboard/doctor` — Doctor Dashboard
  - `/dashboard/admin` — Admin Dashboard
- [ ] Build **Authentication Pages** (`/login`, `/register`)
  - On login success, store JWT in memory (or `httpOnly` cookie — not localStorage)
  - Create `AuthContext` with `useAuth` hook
- [ ] Build **Calendaring Interface** for appointment scheduling:
  - Install: `npm install @mui/x-date-pickers`
  - Date/time picker for selecting appointment slots
  - Submit to `POST /api/appointments`
  - Display `409 Conflict` error gracefully when collision detected
- [ ] Build **EHR Record Forms** with highly structured Material-UI components:
  - Patient history view (chronological)
  - Doctor note-taking form (rich text or structured form)
  - Diagnostic file upload component

---

### ✔️ Week 2 Completion Checklist
- [ ] All EHR CRUD endpoints functional and protected
- [ ] Zod validation rejects invalid/malicious inputs
- [ ] Collision detection correctly rejects overlapping appointment slots
- [ ] Frontend routing and auth flow working
- [ ] Calendar UI submits appointments and shows conflicts

---

## ✅ WEEK 3 — WebRTC Telehealth & Signaling Integration

**Goal:** Build the real-time encrypted video consultation infrastructure.

---

### 📡 Phase 3.1 — Socket.io Signaling Microservice

- [ ] Initialize a new Node.js service in `signaling-server/`
- [ ] Install: `npm install socket.io jsonwebtoken cors`
- [ ] Create `signaling-server/src/index.ts`:
  - Stand up an HTTP server on `PORT=4000`
  - Attach Socket.io with CORS restricted to frontend origin
- [ ] Implement **JWT validation on socket connection**:
  - Client passes room token as a handshake auth query parameter
  - Server verifies token signature and checks time-lock before allowing `connect`
  - Reject unauthorized connections immediately
- [ ] Implement **Socket.io event handlers** for WebRTC signaling:
  ```
  Event: 'join-room'     → Validate token, join socket room, notify peer
  Event: 'offer'         → Relay RTCSessionDescription offer to peer in room
  Event: 'answer'        → Relay RTCSessionDescription answer back to caller
  Event: 'ice-candidate' → Relay ICE candidate to peer in room
  Event: 'leave-room'    → Notify peer, clean up socket room
  ```
- [ ] Ensure **exactly 2 participants** per room — reject a third connection attempt with an error event

---

### 🔑 Phase 3.2 — Cryptographically Secure Room Token Generation

- [ ] Create `server/src/services/roomToken.service.ts`
- [ ] Implement `generateRoomToken(appointmentId, startTime, endTime)`:
  ```typescript
  // Token payload: { appointmentId, validFrom: startTime, validUntil: endTime }
  // Sign with HMAC-SHA256 using JWT_SECRET
  // Token is single-use and time-locked
  ```
- [ ] Add endpoint `GET /api/telehealth/token/:appointmentId`:
  - Only callable by the patient or doctor assigned to that appointment
  - Only callable within a 5-minute window of the appointment start time
  - Returns a time-locked JWT room token
- [ ] Store generated token in the `Appointment` document

---

### 🎥 Phase 3.3 — WebRTC Logic in React Frontend

- [ ] Create a custom hook `client/src/hooks/useWebRTC.ts`:
  ```typescript
  // Manages:
  // - getUserMedia() — requests camera + microphone permissions
  // - RTCPeerConnection setup with STUN/TURN server config
  // - Offer/Answer SDP creation and setting
  // - ICE candidate collection and signaling via Socket.io
  // - Local and remote MediaStream state
  // - Connection state monitoring
  ```
- [ ] Configure **STUN servers** in `RTCConfiguration`:
  ```javascript
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
  ```
- [ ] Build the **Consultation Room Page** (`/consultation/:appointmentId`):
  - On mount: fetch room token, connect to signaling server socket
  - Display local video (muted) in a small Picture-in-Picture overlay
  - Display remote video in the main area
  - Controls: mute/unmute, camera on/off, end call button
- [ ] Implement **graceful degradation**:
  - On `iceconnectionstatechange` → `'disconnected'` or `'failed'`: show reconnect UI
  - On `getUserMedia` failure: show friendly permissions error, guide user to browser settings
  - On signaling server disconnect: attempt socket reconnection (Socket.io auto-reconnect)
- [ ] **Link scheduling to telehealth**: After doctor approves an appointment, the UI displays a "Join Room" button that only activates within the valid token window

---

### ✔️ Week 3 Completion Checklist
- [ ] Signaling microservice running and handling all 5 WebRTC events
- [ ] Token generation enforces time-locking and role restriction
- [ ] WebRTC connection established between two browser tabs/devices
- [ ] Local and remote video streams displaying correctly
- [ ] Graceful degradation tested (manually kill network, check UI response)
- [ ] Room token fetched from backend and passed to Socket.io handshake

---

## ✅ WEEK 4 — Prescription Generation, Security Audits & Final Deployment

**Goal:** Complete the clinical workflow with verifiable prescriptions, harden the platform, and ship to production.

---

### 📄 Phase 4.1 — Digital Prescription Module

- [ ] Install: `npm install pdfkit qrcode crypto`
- [ ] Create `server/src/services/prescription.service.ts`
- [ ] Implement `generatePrescription(prescriptionData)`:

  **Step 1 — Build canonical payload:**
  ```typescript
  const payload = {
    prescriptionId, patientName, doctorName, doctorLicense,
    issuedAt, medications, appointmentId
  }
  ```

  **Step 2 — Compute cryptographic hash:**
  ```typescript
  const hash = crypto.createHmac('sha256', PDF_SIGNING_SECRET)
                     .update(JSON.stringify(payload))
                     .digest('hex');
  ```

  **Step 3 — Generate QR code:**
  ```typescript
  // QR encodes: { verificationUrl: `https://yourapp.com/api/prescriptions/verify/${hash}` }
  const qrDataUrl = await QRCode.toDataURL(verificationUrl);
  ```

  **Step 4 — Build PDF with PDFKit:**
  ```
  - Clinic header with logo placeholder
  - Doctor information section
  - Patient information section
  - Medications table (drug name, dosage, frequency, duration)
  - Issued date & digital signature line
  - Hash string printed in small font at footer
  - QR code embedded at bottom-right
  ```

- [ ] Build Prescription API endpoints:
  - `POST /api/prescriptions` — doctor only, calls `generatePrescription`, saves to DB, uploads PDF to cloud storage
  - `GET /api/prescriptions/:id/download` — patient or doctor retrieves signed PDF
  - `GET /api/prescriptions/verify/:hash` — **public, unauthenticated** endpoint for pharmacies to verify authenticity
- [ ] Verify that PDFs are binary-identical when re-hashed (test authenticity flow end-to-end)

---

### 🔬 Phase 4.2 — Security Auditing & Hardening

- [ ] **Static Code Analysis**:
  - Enable CodeQL in `.github/workflows/codeql.yml`
  - Run analysis on every PR targeting `main`
  - Fix all CodeQL findings rated **Medium** or higher before proceeding

- [ ] **Dependency Vulnerability Scanning**:
  - Ensure `dependabot.yml` is configured for `npm` in all three package directories
  - Run `npm audit` in all three services — resolve all **High** and **Critical** findings

- [ ] **Manual Security Review Checklist**:
  - [ ] All PHI endpoints are behind `authMiddleware` + `roleGuard`
  - [ ] No raw MongoDB queries — all queries go through Mongoose with validated inputs
  - [ ] No sensitive values (keys, secrets) in source code or git history
  - [ ] JWT secret is ≥ 256 bits
  - [ ] `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` headers set (use `helmet` middleware)
  - [ ] Rate limiting applied to auth endpoints (use `express-rate-limit`)
  - [ ] Confirm AES-256 encryption active on all PHI fields (write integration test)
  - [ ] Audit logs present for all PHI access (write integration test)

- [ ] Install and configure **Helmet.js**: `npm install helmet`
- [ ] Install and configure **rate limiter**: `npm install express-rate-limit`

---

### 🐳 Phase 4.3 — Containerization with Docker

- [ ] Write `Dockerfile` for `server/`:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  EXPOSE 5000
  CMD ["node", "dist/index.js"]
  ```
- [ ] Write `Dockerfile` for `client/` (multi-stage build with Nginx)
- [ ] Write `Dockerfile` for `signaling-server/`
- [ ] Write `docker-compose.yml` tying all services together:
  ```yaml
  services:
    mongodb:      # MongoDB with persistent volume
    server:       # Backend API (depends on mongodb)
    signaling:    # Signaling microservice (depends on server)
    client:       # React frontend via Nginx
  ```
- [ ] Write `docker-compose.prod.yml` with:
  - Environment variables loaded from `.env.prod`
  - No development dependencies
  - Health checks for all services
  - Restart policies: `unless-stopped`
- [ ] Test: `docker-compose up --build` and verify all services communicate correctly

---

### ☁️ Phase 4.4 — Cloud Deployment

- [ ] Choose cloud provider (AWS EC2 / DigitalOcean Droplet / Railway)
- [ ] Set up SSH access and install Docker on the server
- [ ] Configure Nginx as reverse proxy with SSL (use Certbot for Let's Encrypt TLS)
- [ ] Set up DNS to point your domain to the server IP
- [ ] Push Docker images to a container registry (Docker Hub or GitHub Container Registry)
- [ ] Pull images and start services on the cloud server:
  ```bash
  docker-compose -f docker-compose.prod.yml pull
  docker-compose -f docker-compose.prod.yml up -d
  ```
- [ ] Set up monitoring (UptimeRobot or similar) to alert on downtime — maintain ≥ 99.8% uptime SLA

---

### 📖 Phase 4.5 — Repository Documentation Finalization

- [ ] Ensure `README.md` is complete and accurate (all env variables, setup steps, crypto details)
- [ ] Update `IMPLEMENTATION_PLAN.md` with any deviations from the original plan
- [ ] Create `SECURITY.md` documenting:
  - All cryptographic algorithms used (algorithm name, key size, mode, use case)
  - How to rotate encryption keys without data loss
  - Responsible disclosure policy
- [ ] Write `DEPLOYMENT.md` with exact step-by-step production deployment guide
- [ ] Ensure all API routes have inline JSDoc comments

---

### ✔️ Week 4 Completion Checklist
- [ ] Prescription PDF generated with embedded QR code
- [ ] Pharmacy verification endpoint returns correct authenticity result
- [ ] CodeQL scan passes with zero critical findings
- [ ] `npm audit` shows zero high/critical vulnerabilities
- [ ] All services running in Docker containers locally
- [ ] `docker-compose up --build` works from a clean checkout
- [ ] Application deployed to cloud and accessible via HTTPS
- [ ] All README documentation finalized and accurate

---

## 🏁 Final Project Verification Checklist

Run these end-to-end tests before marking the project complete:

| Test | Pass? |
|---|---|
| Register patient → login → book appointment → receive confirmation email | ⬜ |
| Doctor logs in → approves appointment → joins consultation room | ⬜ |
| Patient joins the same consultation room (WebRTC connection < 3 seconds) | ⬜ |
| Doctor generates prescription → patient downloads PDF | ⬜ |
| Pharmacy accesses verify endpoint → prescription confirmed authentic | ⬜ |
| Attempt to book overlapping appointment → receive 409 Conflict | ⬜ |
| Access PHI endpoint without JWT → receive 401 Unauthorized | ⬜ |
| Check MongoDB directly → PHI fields are ciphertext | ⬜ |
| Check AuditLog collection → entries present for all PHI access | ⬜ |
| Run automated vulnerability scan → zero critical flaws | ⬜ |

---

*Reference this document daily during development. Each phase builds on the previous — do not skip ahead.*
