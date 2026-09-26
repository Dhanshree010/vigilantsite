"""
VisionOps Edge Vision Worker.
Runs real-time video capture, YOLO inference, Hierarchical IOU PPE anchoring,
ByteTrack persistence tracking, danger zone polygon checks, and dispatches HTTP webhooks.
"""

import sys
import os
import time
import argparse
import base64
import threading
from typing import List

import cv2
import numpy as np
import requests

from detector import PPEDetector
from tracker import PersistenceTracker
from geofence import GeoFenceManager


def send_webhook_async(api_url: str, payload: dict):
    def _post():
        try:
            resp = requests.post(api_url, json=payload, timeout=4.0)
            if resp.status_code in [200, 201]:
                print(f"[Edge Worker] -> Dispatched alert: {payload['violationType']} (Track #{payload['workerTrackId']}) -> HTTP {resp.status_code}")
        except Exception as e:
            print(f"[Edge Worker] Webhook dispatch notice: Server at {api_url} unreachable ({e}).")

    thread = threading.Thread(target=_post, daemon=True)
    thread.start()


def encode_frame_to_base64(frame) -> str:
    success, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
    if success:
        return "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")
    return ""


def main():
    parser = argparse.ArgumentParser(description="VisionOps Edge AI Worker")
    parser.add_argument("--source", default="simulate", help="Video source: '0' for webcam, file path, or 'simulate'")
    parser.add_argument("--api", default="http://localhost:5000/api/violations", help="Backend violation webhook endpoint")
    parser.add_argument("--camera-id", default="CAM_01_BAY_NORTH", help="ID of this camera node")
    parser.add_argument("--model", default=None, help="Path to custom YOLOv8 .pt or .onnx weights")
    parser.add_argument("--no-display", action="store_true", help="Run headless without cv2.imshow GUI")
    args = parser.parse_args()

    print("==================================================")
    print("[VisionOps] Edge AI Video Pipeline Worker Starting")
    print(f" Camera Source:     {args.source}")
    print(f" API Destination:   {args.api}")
    print(f" Camera Node ID:    {args.camera_id}")
    print("==================================================")

    detector = PPEDetector(model_path=args.model)
    tracker = PersistenceTracker(hysteresis_frames=15, alert_cooldown_frames=120)
    geofence_mgr = GeoFenceManager()

    # Configure sample danger zone (normalized coordinates)
    geofence_mgr.add_zone(
        zone_id="ZONE_HEAVY_MACHINERY",
        name="Loading Bay 3 - Heavy Machinery Zone",
        polygon_coords=[
            {"x": 0.40, "y": 0.30},
            {"x": 0.90, "y": 0.30},
            {"x": 0.95, "y": 0.85},
            {"x": 0.35, "y": 0.85}
        ],
        danger_level="CRITICAL"
    )

    cap = None
    is_simulation = args.source.lower() == "simulate"

    if not is_simulation:
        src = int(args.source) if args.source.isdigit() else args.source
        cap = cv2.VideoCapture(src)
        if not cap.isOpened():
            print(f"[Edge Worker] Warning: Cannot open video source '{args.source}'. Falling back to high-fidelity simulation.")
            is_simulation = True

    frame_idx = 0
    fps_timer = time.time()
    fps_counter = 0
    fps = 30.0

    try:
        while True:
            frame_idx += 1
            start_time = time.time()

            if is_simulation:
                # Generate clean synthetic industrial surveillance frame
                frame = np.full((720, 1280, 3), (30, 34, 42), dtype=np.uint8)
                # Draw industrial floor grid
                for y in range(250, 720, 80):
                    cv2.line(frame, (0, y), (1280, y), (45, 52, 65), 1)
                for x in range(0, 1280, 120):
                    cv2.line(frame, (x, 250), (x, 720), (45, 52, 65), 1)
            else:
                ret, frame = cap.read()
                if not ret:
                    # Loop video if file ends
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

            h, w = frame.shape[:2]

            # 1. Detect workers and anchor safety gear
            raw_detections = detector.detect_and_anchor(frame, frame_idx)

            # 2. Evaluate physical danger zones (Geofencing)
            for det in raw_detections:
                breaches = geofence_mgr.evaluate_worker(det["box"], w, h)
                if breaches:
                    det["violations"].append("ZONE_INTRUSION")
                    det["zone_name"] = breaches[0].name
                else:
                    det["zone_name"] = "General Floor"

            # 3. Update multi-frame persistence tracker
            tracked_workers, confirmed_alerts = tracker.update(raw_detections, frame_idx)

            # 4. Dispatch confirmed alerts (after N >= 15 continuous infraction frames)
            if confirmed_alerts:
                snapshot_b64 = encode_frame_to_base64(frame)
                for alert in confirmed_alerts:
                    payload = {
                        "cameraId": args.camera_id,
                        "zoneName": "Loading Bay 3 - Heavy Machinery Zone",
                        "violationType": alert["violationType"],
                        "workerTrackId": alert["workerTrackId"],
                        "confidenceScore": round(float(alert["confidenceScore"]), 2),
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                        "snapshotUrl": snapshot_b64
                    }
                    send_webhook_async(args.api, payload)

            # 5. Render Edge HUD Overlay
            # Draw Danger Zone Polygon
            zone_pts = np.array([[int(p["x"] * w), int(p["y"] * h)] for p in geofence_mgr.zones[0].coords], np.int32)
            zone_pts = zone_pts.reshape((-1, 1, 2))
            overlay = frame.copy()
            cv2.fillPoly(overlay, [zone_pts], (0, 0, 180))
            cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)
            cv2.polylines(frame, [zone_pts], True, (0, 140, 255), 2)
            cv2.putText(frame, "DANGER ZONE: RESTRICTED", (int(0.42 * w), int(0.34 * h)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 160, 255), 2)

            # Draw Worker Bounding Boxes & HUD status
            for wkr in tracked_workers:
                x1, y1, x2, y2 = wkr["box"]
                tid = wkr.get("track_id", "?")
                violations = wkr.get("violations", [])

                is_compliant = len(violations) == 0
                color = (0, 220, 80) if is_compliant else (0, 0, 240)  # Green or Red

                # Worker Box
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # Header Tag
                status_text = f"Worker #{tid} | " + ("COMPLIANT" if is_compliant else ", ".join(violations))
                cv2.rectangle(frame, (x1, max(0, y1 - 24)), (x1 + len(status_text) * 9, y1), color, -1)
                cv2.putText(frame, status_text, (x1 + 4, max(14, y1 - 7)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

            # Global Telemetry Banner
            fps_counter += 1
            if time.time() - fps_timer >= 1.0:
                fps = fps_counter / (time.time() - fps_timer)
                fps_counter = 0
                fps_timer = time.time()

            cv2.rectangle(frame, (0, 0), (w, 42), (18, 22, 28), -1)
            telemetry = f"VisionOps Edge AI | Camera: {args.camera_id} | FPS: {fps:.1f} | Workers Tracked: {len(tracked_workers)}"
            cv2.putText(frame, telemetry, (14, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 180), 2)

            # Optional display window
            if not args.no_display:
                cv2.imshow("VisionOps Edge AI Video Pipeline", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            # Maintain smooth playback loop (~30 fps)
            elapsed = time.time() - start_time
            sleep_duration = max(0.001, (1.0 / 30.0) - elapsed)
            time.sleep(sleep_duration)

    except KeyboardInterrupt:
        print("\n[Edge Worker] Stopping video pipeline.")
    finally:
        if cap:
            cap.release()
        cv2.destroyAllWindows()
        print("[Edge Worker] Pipeline exited cleanly.")


if __name__ == "__main__":
    main()
