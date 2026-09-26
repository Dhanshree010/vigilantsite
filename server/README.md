# VisionOps Server Tier (Node.js + Express + Socket.io)

The VisionOps Backend is an enterprise-grade REST and WebSocket application server designed to ingest high-frequency computer vision telemetry, enforce safety incident debouncing, coordinate multi-tenant dashboard state, and stream instant alerts to safety teams.

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint and DB status |
| `POST` | `/api/violations` | Webhook ingestion from edge AI worker (debounced) |
| `GET` | `/api/violations` | Retrieve violations with filtering (`status`, `cameraId`, `violationType`) |
| `PATCH` | `/api/violations/:id` | Update status (`UNREVIEWED`, `ACKNOWLEDGED`, `RESOLVED`) |
| `GET` | `/api/violations/stats` | Aggregated analytics & hourly compliance distributions |
| `GET` | `/api/violations/export`| Export audit trail as formatted CSV |
| `GET` | `/api/cameras` | List connected CCTV / RTSP video edge feeds |
| `GET` | `/api/zones` | Retrieve spatial geo-fencing polygon coordinates |
| `POST` | `/api/zones` | Create or update danger boundary zone |
| `POST` | `/api/auth/login` | Authenticate supervisor with JWT |

## ⚡ WebSocket Events (Socket.io)

- **`new_violation`**: Dispatched immediately upon edge incident confirmation ($N \ge 15$ frames).
- **`violation_status_updated`**: Broadcasted when an officer acknowledges or resolves an incident.
- **`edge_heartbeat`**: Live camera FPS and active tracked workers telemetry.
- **`simulate_violation`**: Client-side interactive trigger for demo testing.
