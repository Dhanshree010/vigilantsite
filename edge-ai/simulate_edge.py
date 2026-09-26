"""
VisionOps Edge AI Test Simulator.
Simulates real-time edge processing and dispatches sample events directly
to the Node.js API to verify the end-to-end webhook-to-dashboard pipeline.
"""

import os
import sys
import time
import requests
import random

API_ENDPOINT = os.environ.get("API_URL", "http://127.0.0.1:5000/api/violations")

SAMPLE_VIOLATIONS = [
    {
        "cameraId": "CAM_01_BAY_NORTH",
        "zoneName": "Loading Bay 3 - Heavy Machinery Zone",
        "violationType": "NO_HELMET",
        "workerTrackId": 14,
        "confidenceScore": 0.94,
        "snapshotUrl": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
    },
    {
        "cameraId": "CAM_02_SCAFFOLDING",
        "zoneName": "Elevated Deck Zone A",
        "violationType": "NO_VEST",
        "workerTrackId": 27,
        "confidenceScore": 0.91,
        "snapshotUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80"
    },
    {
        "cameraId": "CAM_04_FORKLIFT_LANE",
        "zoneName": "Restricted Forklift Perimeter",
        "violationType": "ZONE_INTRUSION",
        "workerTrackId": 33,
        "confidenceScore": 0.97,
        "snapshotUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    }
]

def run_simulation(cycles=5, interval=3):
    print("==================================================")
    print(" VisionOps Edge Simulator Starting")
    print(f" Target API: {API_ENDPOINT}")
    print(f" Disagreeable events to fire: {cycles}")
    print("==================================================")

    for i in range(cycles):
        event = random.choice(SAMPLE_VIOLATIONS).copy()
        event["workerTrackId"] = random.randint(10, 99)
        event["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())

        print(f"\n[Test #{i+1}] Transmitting confirmed infraction ({event['violationType']}) for Worker #{event['workerTrackId']}...")
        try:
            res = requests.post(API_ENDPOINT, json=event, timeout=5)
            print(f"   Response Status: {res.status_code}")
            print(f"   Payload Data:    {res.json()}")
        except Exception as e:
            print(f"   Failed to connect to backend: {e}")
            print("   Make sure the server is running (cd server && npm run dev)")
            break

        if i < cycles - 1:
            time.sleep(interval)

    print("\n[OK] Simulation cycle completed.")

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    run_simulation(cycles=count)
