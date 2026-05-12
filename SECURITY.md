# Security Policy

## Security Measures

### 1. PHI Encryption
All Protected Health Information (PHI) is encrypted at the field level using **AES-256-CBC**. Fields such as patient names, contact info, and medical notes are stored as ciphertext in the database.

### 2. Digital Prescriptions
Prescriptions are generated as PDFs with:
- **HMAC-SHA256** cryptographic hashes for authenticity.
- **QR Codes** for quick verification by pharmacies.
- Digital signatures linked to the issuing doctor.

### 3. API Security
- **JWT Authentication**: Secure token-based access.
- **Role-Based Access Control (RBAC)**: Strict separation between patient, doctor, and admin roles.
- **Helmet.js**: Protection against common web vulnerabilities (XSS, Clickjacking, etc.).
- **Rate Limiting**: Protection against brute-force and DDoS attacks.

### 4. Audit Logging
Every access or modification to medical records is logged in an immutable audit trail, capturing:
- User ID
- Timestamp
- Action performed
- IP Address

## Vulnerability Disclosure
If you discover a security vulnerability, please do not open a public issue. Instead, contact the security team at security@telemed-ehr.com.
