# VisionOps Edge AI & Inference Layer

This directory contains the Python-based edge computer vision worker that processes raw camera streams (RTSP / USB / WebCam / Simulation), anchors safety gear to worker hulls, enforces spatial danger boundaries, tracks worker persistence across time, and dispatches incident webhooks to the central backend.

## 🧠 Core Computer Vision Innovations

1. **Hierarchical IOU Worker Anchoring (`src/detector.py`)**:
   Instead of detecting floating hardhats independently, hardhats are spatially intersected with the cranial region (upper 25% of worker bounding box) and safety vests with the torso region (20% to 75% height) using Intersection-over-Union (IoU) checks.

2. **ByteTrack Persistence & Temporal Hysteresis (`src/tracker.py`)**:
   Mitigates alert fatigue and transient occlusion noise. An infraction is strictly triggered only if uncorrected across $N \ge 15$ continuous frames. Single-frame glitches are automatically filtered out.

3. **Danger Zone Polygon Geo-Fencing (`src/geofence.py`)**:
   Uses Shapely polygon intersection (with ray-casting fallback) to test whether worker feet coordinates enter restricted heavy-machinery or scaffolding zones.

## 🚀 Usage

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Live Edge Pipeline
```bash
# Run on webcam 0
python src/worker.py --source 0 --api http://localhost:5000/api/violations

# Run in high-fidelity industrial simulator mode
python src/worker.py --source simulate --api http://localhost:5000/api/violations
```

### 3. Rapid Pipeline Verification Test
```bash
python simulate_edge.py 3
```
