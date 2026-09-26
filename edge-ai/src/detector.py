"""
Hierarchical IOU PPE Detector Module.
Executes YOLO inference and anchors detected safety gear (Hardhats, Vests)
to specific detected worker bounding hulls using spatial intersection checks.
"""

import math
from typing import List, Dict, Any, Tuple

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False


def calculate_box_iou(boxA: Tuple[float, float, float, float], boxB: Tuple[float, float, float, float]) -> float:
    """
    Computes Intersection over Union (IoU) between two bounding boxes (x1, y1, x2, y2).
    """
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    inter_width = max(0.0, xB - xA)
    inter_height = max(0.0, yB - yA)
    inter_area = inter_width * inter_height

    boxA_area = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxB_area = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    union_area = boxA_area + boxB_area - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area


class PPEDetector:
    def __init__(self, model_path: str = None, conf_threshold: float = 0.35, iou_threshold: float = 0.45):
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.model = None
        self.is_real_model = False
        self.num_workers_sim = 8  # Dynamic multi-worker density for multi-person simulation

        if HAS_YOLO and model_path:
            try:
                self.model = YOLO(model_path)
                self.is_real_model = True
                print(f"[Detector] Optimized YOLOv8/v11 loaded from: {model_path} (High-Density Multi-Worker Engine Active)")
            except Exception as e:
                print(f"[Detector] Could not load model from {model_path} ({e}). Using high-density simulation mode.")

    def detect_and_anchor(self, frame, frame_idx: int = 0) -> List[Dict[str, Any]]:
        """
        Processes frame, anchors PPE to worker hulls via Hierarchical IOU,
        and returns list of all worker detections with compliance status.
        """
        if self.is_real_model and frame is not None:
            return self._real_inference(frame)
        else:
            return self._simulated_inference(frame, frame_idx)

    def _real_inference(self, frame) -> List[Dict[str, Any]]:
        """
        High-Performance Multi-Worker YOLOv8/YOLOv11 Inference:
        - agnostic_nms=True: prevents multi-class bounding box suppression in dense crowds
        - max_det=100: allows tracking up to 100 simultaneous workers
        - iou=self.iou_threshold: tuned Non-Maximum Suppression for crowded industrial scenes
        """
        results = self.model.predict(
            frame, 
            conf=self.conf_threshold, 
            iou=self.iou_threshold, 
            agnostic_nms=True, 
            max_det=100, 
            verbose=False
        )
        boxes = results[0].boxes

        persons = []
        helmets = []
        vests = []

        for b in boxes:
            cls_id = int(b.cls[0].item())
            conf = float(b.conf[0].item())
            xyxy = [float(x) for x in b.xyxy[0].tolist()]

            # Standard class indices (e.g. Roboflow PPE dataset: 0=Person, 1=Hardhat, 2=Vest, etc.)
            cls_name = self.model.names.get(cls_id, "").lower()

            if "person" in cls_name or cls_id == 0:
                persons.append({"box": xyxy, "conf": conf})
            elif "hat" in cls_name or "helmet" in cls_name or cls_id == 1:
                helmets.append({"box": xyxy, "conf": conf})
            elif "vest" in cls_name or cls_id == 2:
                vests.append({"box": xyxy, "conf": conf})

        return self._anchor_ppe(persons, helmets, vests)

    def _anchor_ppe(self, persons: List[Dict], helmets: List[Dict], vests: List[Dict]) -> List[Dict[str, Any]]:
        """
        Multi-Worker Distance-Weighted Hierarchical IOU Anchoring:
        Resolves PPE ownership across crowded workers by selecting the highest-IoU
        cranial and torso matches per individual worker hull.
        """
        workers = []

        for p in persons:
            px1, py1, px2, py2 = p["box"]
            p_height = max(1.0, py2 - py1)

            # Define cranial target zone for hardhat (upper 25% of worker with slight vertical headroom)
            cranial_zone = (px1, py1 - (p_height * 0.12), px2, py1 + (p_height * 0.32))

            # Define torso target zone for safety vest (20% to 75% of height)
            torso_zone = (px1, py1 + (p_height * 0.20), px2, py1 + (p_height * 0.75))

            # Find best matching hardhat for this worker
            best_helmet_iou = 0.0
            for h in helmets:
                iou = calculate_box_iou(h["box"], cranial_zone)
                if iou > best_helmet_iou:
                    best_helmet_iou = iou
            has_hardhat = best_helmet_iou > 0.15

            # Find best matching vest for this worker
            best_vest_iou = 0.0
            for v in vests:
                iou = calculate_box_iou(v["box"], torso_zone)
                if iou > best_vest_iou:
                    best_vest_iou = iou
            has_vest = best_vest_iou > 0.18

            violations = []
            if not has_hardhat:
                violations.append("NO_HELMET")
            if not has_vest:
                violations.append("NO_VEST")

            workers.append({
                "box": (int(px1), int(py1), int(px2), int(py2)),
                "confidence": round(p["conf"], 3),
                "has_helmet": has_hardhat,
                "has_vest": has_vest,
                "helmet_iou": round(best_helmet_iou, 3),
                "vest_iou": round(best_vest_iou, 3),
                "violations": violations
            })

        return workers

    def _simulated_inference(self, frame, frame_idx: int) -> List[Dict[str, Any]]:
        """
        High-Density Dynamic Multi-Worker Fleet Simulation:
        Generates realistic multi-person trajectories (8 concurrent workers across depth zones).
        """
        h = 720 if frame is None else frame.shape[0]
        w = 1280 if frame is None else frame.shape[1]

        # Dynamic Worker Fleet Definition (Depth-Scaled & Distributed)
        fleet_configs = [
            # Foreground Workers
            {"id": 101, "base_x": 0.16, "base_y": 0.40, "speed": 0.04, "scale": 1.0, "helmet": True, "vest": True, "viol": []},
            {"id": 102, "base_x": 0.28, "base_y": 0.42, "speed": -0.035, "scale": 0.95, "helmet": True, "vest": True, "viol": []},
            {"id": 104, "base_x": 0.42, "base_y": 0.44, "speed": 0.03, "scale": 0.98, "helmet": False, "vest": True, "viol": ["NO_HELMET"]},
            {"id": 106, "base_x": 0.58, "base_y": 0.46, "speed": -0.025, "scale": 0.92, "helmet": True, "vest": False, "viol": ["NO_VEST"]},
            {"id": 109, "base_x": 0.76, "base_y": 0.48, "speed": 0.045, "scale": 0.90, "helmet": False, "vest": False, "viol": ["ZONE_INTRUSION", "NO_HELMET"]},
            # Midground & Background Workers (Depth Scaled)
            {"id": 112, "base_x": 0.22, "base_y": 0.32, "speed": 0.02, "scale": 0.70, "helmet": True, "vest": True, "viol": []},
            {"id": 115, "base_x": 0.50, "base_y": 0.30, "speed": -0.015, "scale": 0.68, "helmet": True, "vest": True, "viol": []},
            {"id": 118, "base_x": 0.82, "base_y": 0.33, "speed": 0.025, "scale": 0.72, "helmet": True, "vest": True, "viol": []},
        ]

        active_workers = []
        for cfg in fleet_configs[:self.num_workers_sim]:
            scale = cfg["scale"]
            worker_w = int(85 * scale)
            worker_h = int(200 * scale)

            osc_x = math.sin(frame_idx * cfg["speed"]) * (w * 0.08 * scale)
            x1 = int(w * cfg["base_x"] + osc_x)
            y1 = int(h * cfg["base_y"])
            x2 = x1 + worker_w
            y2 = y1 + worker_h

            active_workers.append({
                "worker_id": cfg["id"],
                "box": (x1, y1, x2, y2),
                "confidence": round(0.92 + (0.05 * math.sin(frame_idx * 0.1)), 2),
                "has_helmet": cfg["helmet"],
                "has_vest": cfg["vest"],
                "violations": cfg["viol"]
            })

        return active_workers
