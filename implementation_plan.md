# 🗓️ Implementation Plan — Telemedicine & EHR Platform
**Duration:** 4 Weeks | **Stack:** React · TypeScript · Node.js · MongoDB · WebRTC · Socket.io

---

## Overview

| Week | Theme | Core Deliverables |
|---|---|---|
| Week 1 | Compliance Architecture & Cryptographic Foundations | Repo setup, MongoDB schema, AES-256 encryption, Audit Logging |
| Week 2 | EHR APIs & Scheduling Engine | CRUD APIs, Zod validation, Collision-detection algorithm, React frontend init |
| Week 3 | WebRTC Telehealth Integration | Signaling microservice, WebRTC room UI, Secure token-gated room access |
| Week 4 | Prescription Generation, Security Audits & Deployment | PDF prescriptions, QR verification, vulnerability scanning, Docker deployment |

---

## Week 1: Compliance Architecture, Schema Design & Cryptographic Foundations

**Goal:** Establish a production-grade, security-first codebase foundation before a single patient record is ever written.

---

### Day 1–2: Repository & Project Scaffolding

**Tasks:**
- Initialize a GitHub repository with the following branch protection rules:
  - `main` branch: require pull request + minimum 1 peer approval before merge
  - Disable direct force-pushes
- Scaffold three sub-projects with the following structure:
  ```
  /backend    → Node.js + Express.js + TypeScript
  /frontend   → React + TypeScript + Material-UI (CRA or Vite)
  /signaling  → Node.js + Socket.io
  ```
- Configure ESLint + Prettier for consistent code style
- Set up a `docker-compose.yml` with services for `backend`, `frontend`, `signaling`, and `mongo`

**Deliverable:** Clean repo with CI-ready structure and branch protection active.

---

### Day 3–4: MongoDB Schema Design

**Tasks:**
- Provision MongoDB (local Docker container or MongoDB Atlas)
- Install Mongoose and define the following schemas in `/backend/src/models/`:

  **Patient.ts**
  ```
  Fields: firstName*, lastName*, dateOfBirth*, gender, contactNumber*,
          email*, address, emergencyContact, allergies*[], bloodGroup*,
          vitalSigns*[], diagnoses*[], createdAt, updatedAt
  (* = PHI — must be encrypted)
  ```

  **Doctor.ts**
  ```
  Fields: firstName, lastName, specialization, licenseNumber,
          email, availabilitySlots[], clinicId
  ```

  **Appointment.ts**
  ```
  Fields: patientId (ref), doctorId (ref), startTime, endTime,
          status (pending/approved/cancelled), roomToken,
          tokenExpiresAt, createdAt
  ```

  **MedicalRecord.ts**
  ```
  Fields: patientId (ref), doctorId (ref), appointmentId (ref),
          chiefComplaint*, clinicalNotes*, diagnosis*,
          attachments[], createdAt
  (* = PHI — must be encrypted)
  ```

  **Prescription.ts**
  ```
  Fields: patientId (ref), doctorId (ref), appointmentId (ref),
          medications*[] (name, dosage, frequency, duration),
          digitalSignatureHash, pdfUrl, qrCode, issuedAt
  (* = PHI — must be encrypted)
  ```

**Deliverable:** All Mongoose models defined, DB connection confirmed.

---

### Day 5–7: Security Foundation — AES-256 Encryption & Audit Logging

**Tasks:**

**Field-Level Encryption (AES-256)**
- Create `/backend/src/config/encryption.ts`:
  - Implement `encrypt(plaintext: string): string` using Node.js `crypto` module with AES-256-CBC
  - Implement `decrypt(ciphertext: string): string`
  - Key sourced exclusively from `process.env.AES_ENCRYPTION_KEY`
- Attach Mongoose pre-save hooks on all PHI fields in Patient and MedicalRecord models:
  ```typescript
  PatientSchema.pre('save', function(next) {
    if (this.isModified('firstName')) this.firstName = encrypt(this.firstName);
    // ... repeat for all PHI fields
    next();
  });
  ```
- Attach Mongoose post-find hooks to transparently decrypt on read

**JWT Authentication**
- Install `jsonwebtoken` and `bcryptjs`
- Create `/backend/src/middleware/auth.ts`:
  - Validate Bearer token on every protected route
  - Attach `req.user` with `{ id, role }`
- Create auth routes: `POST /api/auth/register`, `POST /api/auth/login`

**Audit Logging Middleware**
- Create `/backend/src/middleware/auditLogger.ts`
- Intercept every request touching PHI endpoints and write an immutable log:
  ```typescript
  {
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    ipAddress: req.ip,
    method: req.method,
    endpoint: req.originalUrl,
    action: "READ_PATIENT_RECORD" // descriptive constant
  }
  ```
- Store logs in a dedicated `AuditLog` MongoDB collection (no delete or update operations permitted on this collection)

**Deliverable:** Encryption unit-tested, audit logs appearing on every PHI API hit, JWT login/register working.

---

## Week 2: EHR API Development & Algorithmic Scheduling Engine

**Goal:** Build the full data access layer and the core scheduling intelligence, then wire up the React frontend.

---

### Day 8–10: EHR CRUD APIs with Input Validation

**Tasks:**
- Install `zod` and create reusable Zod schemas for all request bodies
- Build the following Express route files under `/backend/src/routes/`:

  **`/api/patients`**
  - `GET /:id` — fetch patient profile (decrypted, role-gated)
  - `PUT /:id` — update patient profile

  **`/api/records`**
  - `GET /patient/:patientId` — fetch all medical records for a patient
  - `POST /` — create new medical record (doctor only)
  - `PUT /:recordId` — update record (doctor only)

- Apply Zod `.parse()` on every `req.body` before it touches business logic — reject with `400` on schema mismatch
- Apply `auditLogger` middleware to all routes above
- Apply `auth` middleware to all routes above; enforce role-based access (e.g., only `doctor` or `admin` can create records)

**Deliverable:** All EHR endpoints tested with Postman/Insomnia; NoSQL injection attempts return 400.

---

### Day 11–13: Smart Scheduling Engine

**Tasks:**
- Build `/backend/src/services/schedulingService.ts` with the core collision-detection function:

  ```typescript
  async function checkAvailability(
    doctorId: string,
    proposedStart: Date,
    proposedEnd: Date
  ): Promise<boolean> {
    const conflicts = await Appointment.find({
      doctorId,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: proposedEnd, $gte: proposedStart } },
        { endTime:   { $gt: proposedStart, $lte: proposedEnd } },
        { startTime: { $lte: proposedStart }, endTime: { $gte: proposedEnd } }
      ]
    });
    return conflicts.length === 0;
  }
  ```

- Build `/api/appointments` routes:
  - `POST /` — validate payload, run collision check, reject with `409 Conflict` if unavailable, else create
  - `GET /` — list appointments (filtered by role: patient sees own, doctor sees own schedule)
  - `PATCH /:id/approve` — doctor approves; triggers notification
  - `DELETE /:id` — cancel appointment

- Integrate email/SMS notification service (`nodemailer` + Twilio or similar) to send automated reminders upon booking confirmation

**Deliverable:** Double-booking mathematically impossible; confirmation notifications delivered.

---

### Day 14: React Frontend Initialization

**Tasks:**
- Initialize React app with TypeScript in `/frontend`
- Install Material-UI (`@mui/material`), `axios`, `react-router-dom`
- Define TypeScript interfaces matching all backend models (`Patient`, `Appointment`, etc.)
- Build foundational pages:
  - `LoginPage` — JWT auth form
  - `DashboardPage` — role-conditional navigation hub
  - `AppointmentsPage` — calendaring interface (use `@mui/x-date-pickers`)
  - `EHRViewerPage` — structured forms for clinical data entry and display
- Set up `axios` interceptor to attach JWT `Authorization` header on all requests

**Deliverable:** Frontend compiling, routed, and successfully calling backend auth endpoints.

---

## Week 3: WebRTC Telehealth & Signaling Integration

**Goal:** Implement real-time encrypted video consultation infrastructure from the signaling layer down to the browser UI.

---

### Day 15–17: Socket.io Signaling Microservice

**Tasks:**
- Build the standalone signaling server in `/signaling/src/index.ts`
- This server's **only responsibility** is relaying WebRTC negotiation messages — it never touches patient data
- Implement the following Socket.io event handlers:

  | Event (Client → Server) | Server Action |
  |---|---|
  | `join-room` (roomToken) | Validate token; add socket to room |
  | `offer` (sdp) | Relay SDP offer to the other peer in room |
  | `answer` (sdp) | Relay SDP answer to the other peer |
  | `ice-candidate` | Relay ICE candidate to the other peer |
  | `leave-room` | Notify peer; clean up room |

- Token validation: call backend `/api/telehealth/validate-token` before allowing room join
- Target: peer connection established in **< 3 seconds** on local network

**Deliverable:** Two browser tabs able to exchange SDP and establish a peer connection via the signaling server.

---

### Day 18–20: WebRTC React UI — Consultation Room

**Tasks:**
- Create `/frontend/src/pages/ConsultationRoom/ConsultationRoom.tsx`
- Implement the WebRTC hook `/frontend/src/hooks/useWebRTC.ts`:
  ```
  - Request getUserMedia (camera + microphone) with explicit browser permission prompt
  - Create RTCPeerConnection with STUN server config
  - Attach local stream to <video> element
  - Connect to signaling server via Socket.io using the room token
  - Handle offer/answer/ICE-candidate exchange
  - Attach remote stream to second <video> element
  - Implement graceful degradation: on connection failure, show user-friendly error + retry option
  ```
- UI components:
  - Local video tile (muted, small overlay)
  - Remote video tile (full-screen primary)
  - Controls bar: mute mic, disable camera, end call
  - Inline clinical notes panel (doctor only) — saves to MedicalRecord on call end

**Secure Token-Gating:**
- Backend `/api/telehealth/token/:appointmentId`:
  - Verify appointment is approved and within ±15 minutes of scheduled time
  - Generate a cryptographically secure token: `crypto.randomBytes(32).toString('hex')`
  - Store token + expiry in Appointment document
  - Return token to authorized patient/doctor only

**Deliverable:** Full encrypted video consultation between patient and doctor; notes saved on call end.

---

## Week 4: Prescription Generation, Security Audits & Final Deployment

**Goal:** Complete the clinical workflow with prescription generation, harden the system against vulnerabilities, and ship to production.

---

### Day 21–23: Digital Prescription Generator

**Tasks:**
- Install `pdfkit` in backend
- Build `/backend/src/services/prescriptionService.ts`:
  - Accept structured medication input from doctor (drug name, dosage, frequency, duration, instructions)
  - Generate a formatted PDF with:
    - Clinic letterhead / branding header
    - Patient demographics (decrypted)
    - Doctor name + license number + digital signature line
    - Medication table
    - Issue date and expiry
  - Compute a SHA-256 hash of the PDF buffer → store as `digitalSignatureHash`
  - Generate a QR code (use `qrcode` npm package) encoding `{ prescriptionId, hash, verifyUrl }`
  - Embed QR code into the PDF
  - Save PDF to cloud storage (or local `/uploads`) and store URL in Prescription document
- Build `/api/prescriptions` routes:
  - `POST /` — generate prescription (doctor only)
  - `GET /:id/download` — stream PDF to authenticated user
  - `GET /verify/:hash` — **public endpoint** — returns prescription metadata if hash matches (for pharmacy verification)

**Deliverable:** Doctor can generate a prescription; pharmacist can scan QR and hit the public verify endpoint to confirm authenticity.

---

### Day 24–25: Security Hardening & Vulnerability Scanning

**Tasks:**

**Static Code Analysis**
- Enable **GitHub Advanced Security** (or Dependabot) on the repository
- Run `npm audit --audit-level=high` on all three sub-projects; resolve all high/critical findings
- Install and run `eslint-plugin-security` to catch common Node.js security anti-patterns

**Dependency Scanning**
- Review and pin all dependency versions in `package.json`
- Remove any unused packages

**Manual Security Checklist**
- [ ] No `.env` files committed (verify `.gitignore`)
- [ ] All PHI routes require valid JWT
- [ ] Rate limiting applied to `/api/auth/login` (use `express-rate-limit`)
- [ ] HTTP security headers set (use `helmet`)
- [ ] CORS policy restricted to known frontend origin
- [ ] MongoDB user has minimum required permissions (not root)
- [ ] AES key is at least 32 bytes and sourced from environment only
- [ ] No raw PHI appears in any application log

**Target:** Zero critical or high vulnerabilities in automated scan output.

---

### Day 26–27: Docker Containerization & Cloud Deployment

**Tasks:**
- Write `Dockerfile` for each sub-project (multi-stage builds for frontend)
- Finalize `docker-compose.yml`:
  ```yaml
  services:
    mongo:      # MongoDB with volume mount
    backend:    # Node.js API (depends_on: mongo)
    signaling:  # Socket.io server
    frontend:   # React build served via nginx
  ```
- Configure environment-specific `.env` files (`.env.production`)
- Deploy to a secure cloud environment (AWS ECS / Railway / Render / DigitalOcean App Platform)
- Configure HTTPS (TLS certificate via Let's Encrypt or cloud provider)
- Set up basic health-check endpoints (`GET /api/health`) for uptime monitoring

**Deliverable:** Application live on HTTPS with all services running and communicating.

---

### Day 28: Documentation & Final Review

**Tasks:**
- Finalize `README.md` (already drafted) with:
  - Exact local development setup steps (reproducible from scratch)
  - All environment variables documented
  - Cryptographic algorithms used: AES-256-CBC for PHI, SHA-256 for prescription hashing, JWT HS256 for auth
  - Architecture diagram
- Write a brief `SECURITY.md` disclosing the security model and responsible disclosure process
- Conduct a final walkthrough of all three user role workflows end-to-end
- Tag the release as `v1.0.0` on GitHub

**Deliverable:** Fully documented, deployed, and demonstrable application.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WebRTC fails through strict firewalls/NAT | Medium | High | Configure TURN server as fallback (Twilio Network Traversal or coturn) |
| AES key accidentally committed to repo | Low | Critical | Pre-commit hook blocking `.env` files; secret scanning enabled on GitHub |
| MongoDB injection despite Zod validation | Low | High | Use Mongoose strict mode + Zod; never pass raw `req.body` to queries |
| WebRTC connection time exceeds 3s KPI | Medium | Medium | Optimize ICE gathering; use nearby STUN servers; profile signaling latency |
| PDF prescription tampering | Low | Critical | Hash stored server-side; verify endpoint compares server hash, not client input |

---

## Definition of Done (Per Week)

- **Week 1:** AES-256 encryption verified by unit test; audit log entry created for every PHI API call; JWT auth working
- **Week 2:** All EHR CRUD endpoints return correct data; double-booking rejected with `409`; frontend renders appointments calendar
- **Week 3:** Two users can complete a full video consultation; room access blocked outside the ±15 min window
- **Week 4:** Zero critical vulnerabilities in scan; prescription QR verifiable by public endpoint; app live on HTTPS

---

*This implementation plan maps directly to the four-week engineering roadmap defined in the project specification.*
