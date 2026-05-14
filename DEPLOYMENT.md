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

## Cloud Deployment

### 1. Frontend (Vercel)
The project is configured for Vercel deployment.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: URL of your Render API (e.g., `https://telemed-api.onrender.com`)
  - `VITE_SIGNALING_URL`: URL of your Render Signaling server (e.g., `https://telemed-signaling.onrender.com`)

### 2. Backend (Render)
The project includes a `render.yaml` file for easy deployment using Render Blueprints.
- **Connect your GitHub Repository** to Render.
- Render will detect the `render.yaml` and create two Web Services: `telemed-api` and `telemed-signaling`.
- **Environment Variables (telemed-api)**:
  - `MONGODB_URI`: Your MongoDB Atlas connection string.
  - `JWT_SECRET`: Secret key for JWT.
  - `AES_ENCRYPTION_KEY`: 32-character hex key for PHI encryption.
  - `FRONTEND_URL`: Your Vercel deployment URL.
- **Environment Variables (telemed-signaling)**:
  - `JWT_SECRET`: Must match the API server's secret.
  - `ALLOWED_ORIGINS`: Your Vercel deployment URL.
