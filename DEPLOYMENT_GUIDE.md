# 🚀 VigilantSite — Comprehensive Production & Cloud Deployment Guide

This guide details the complete deployment process for the **VigilantSite (VisionOps) Edge AI Workplace Safety OS**.

---

## 🏗️ System Architecture & Deployment Topology

```text
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│  Client (React + Vite)          │  HTTP/WS  │  Server (Node.js + Socket.io)        │
│  Hosted: Vercel / Netlify       ├──────────►│  Hosted: Render / Railway / Docker   │
│  URL: https://vigilantsite.app  │           │  URL: https://api-vigilantsite.com   │
└─────────────────────────────────┘           └──────────────┬───────────────────────┘
                                                             │
                  ┌──────────────────────────────────────────┴───────────────┐
                  ▼                                                          ▼
┌───────────────────────────────────┐                      ┌───────────────────────────────────┐
│  Edge AI Worker (Python YOLOv8)   │                      │  Database (MongoDB Atlas)         │
│  Runs on: Local Laptop / Edge Jetson                     │  Optional: Built-in In-Memory     │
│  Posts to: Cloud Backend Webhook  │                      │  Fallback if MONGO_URI is omitted │
└───────────────────────────────────┘                      └───────────────────────────────────┘
```

---

## 🌟 Method 1: 100% Free Cloud Deployment (Recommended)

This is the easiest, zero-cost method for portfolio showcases, live client demos, and college project viva evaluations.

### Part A: Deploy the Backend API & WebSocket Server on Render.com

1. Go to [Render.com](https://render.com/) and sign up / log in with your GitHub account.
2. Push your project to GitHub (if not already pushed).
3. Click **"New +"** ➜ **"Web Service"**.
4. Connect your GitHub repository.
5. Configure the service settings:
   * **Name**: `vigilantsite-backend` (or your chosen name)
   * **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   * **Root Directory**: `server`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/server.js`
   * **Instance Type**: `Free`
6. Add **Environment Variables** in Render:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Port for Express and Socket.io |
   | `NODE_ENV` | `production` | Optimizes performance |
   | `JWT_SECRET` | `your_secure_random_jwt_secret_key` | Secret key for auth tokens |
   | `CLIENT_URL` | `*` | Allows cross-origin requests |
   | `ALERT_DEBOUNCE_SECONDS` | `5` | Anti-spam interval |
   | `MONGO_URI` | *(Optional)* | Your MongoDB Atlas connection string (leave empty for automatic in-memory store) |
7. Click **"Deploy Web Service"**.
8. Once built, copy your public backend URL (e.g. `https://vigilantsite-backend.onrender.com`).
   * Test health check by visiting: `https://vigilantsite-backend.onrender.com/health`

---

### Part B: Deploy the Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **"Add New..."** ➜ **"Project"**.
3. Import your GitHub repository.
4. Configure the project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click "Edit" and choose `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Add **Environment Variables** in Vercel:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://vigilantsite-backend.onrender.com` (Your Render Backend URL) |
   | `VITE_SOCKET_URL` | `https://vigilantsite-backend.onrender.com` (Your Render Backend URL) |
6. Click **"Deploy"**.
7. Vercel will build the frontend in ~45 seconds and give you a live HTTPS domain (e.g., `https://vigilantsite.vercel.app`)!

---

### Part C: Connect Your Edge AI Python Worker to the Cloud

Once your cloud backend is live, you can run the Edge AI worker from your local laptop webcam or RTSP cameras and stream live safety violations directly to your cloud dashboard:

```bash
# In the project root, activate your python environment:
cd edge-ai

# Connect edge webcam (or simulate) directly to your live cloud URL:
python src/worker.py --source 0 --api https://vigilantsite-backend.onrender.com/api/violations

# Or run the edge simulator against the cloud backend:
python simulate_edge.py 5
```

---

## 🐳 Method 2: Single-Command Docker Deployment (VPS / AWS / DigitalOcean)

If you have a Linux VPS (Ubuntu/Debian on AWS EC2, DigitalOcean Droplet, Hetzner, or Linode), you can deploy the full stack with Docker Compose in a single command.

### 1. Install Docker & Docker Compose on your server:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### 2. Clone the repository and navigate into it:
```bash
git clone https://github.com/your-username/vigilantsite.git
cd vigilantsite
```

### 3. Launch the complete containerized stack:
```bash
docker compose up -d --build
```

### 4. Verify running containers:
```bash
docker compose ps
```
Your services will be immediately online:
* **Frontend**: `http://YOUR_SERVER_IP` (Port 80)
* **Backend API**: `http://YOUR_SERVER_IP:5000`
* **MongoDB**: `localhost:27017`

To stop the deployment:
```bash
docker compose down
```

---

## 📶 Method 3: Local Network (LAN) / College Viva Presentation

If you want to present the project live in a presentation hall, classroom, or lab without deploying to the public internet:

### 1. Find your laptop's Local IP address:
* On Windows PowerShell:
  ```powershell
  ipconfig
  ```
  Look for **IPv4 Address** (e.g. `192.168.1.45`).

### 2. Start the Backend:
```bash
cd server
npm run dev
```

### 3. Start the Frontend with Host Exposure:
```bash
cd client
npm run dev -- --host
```

### 4. Access from any device on the same Wi-Fi:
Open any smartphone, tablet, or external laptop connected to the same Wi-Fi network and navigate to:
```text
http://192.168.1.45:5173
```
You can project the screen on the podium laptop while evaluators interact with the system on their own tablets or phones!

---

## 🔑 Demo Login Credentials for Evaluators

When sharing your deployed application, provide these pre-configured demo credentials:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Chief Safety Officer** | `officer@visionops.ai` | `safety2026` | Full Access: CCTV audits, Stop-Work directives, OSHA citations, CSV/PDF export, KPI analytics |
| **Bay Controller** | `controller@visionops.ai` | `cctv2026` | Focused Access: Real-time webcams, multi-worker crowd scanner, live surveillance monitoring |

---

## 🛠️ Verification Checklist After Deployment

- [ ] **Backend Health Check**: Open `https://your-backend-url/health` ➜ Returns `{"status": "HEALTHY"}`.
- [ ] **WebSocket Gateway**: Open Developer Tools Console (F12) on client ➜ Shows `⚡ Connected to VisionOps WebSocket Gateway`.
- [ ] **Demo Logins**: Click "Safety Officer Demo Account" ➜ Authenticates instantly.
- [ ] **Dynamic Multi-Worker Scan**: Switch to "12 Workers (Max Crowd)" ➜ All 12 workers are tracked with depth scaling and cranial inspection sub-boxes.
- [ ] **Audit Reports**: Click "Export Compliance Audit (CSV)" ➜ Downloads cleanly.
