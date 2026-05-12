# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

## Production Deployment with Docker

1. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_ultra_secure_jwt_secret
   PDF_SIGNING_SECRET=your_secure_signing_secret
   BASE_URL=https://your-domain.com
   ```

2. **Build and Start**:
   ```bash
   docker-compose up --build -d
   ```

3. **Verify**:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:5000`
   - Signaling Server: `http://localhost:4000`

## Manual Deployment (Local)

### 1. Server
```bash
cd server
npm install
npm start
```

### 2. Signaling Server
```bash
cd signaling-server
npm install
npm start
```

### 3. Frontend
```bash
npm install
npm run build
npm run preview
```
