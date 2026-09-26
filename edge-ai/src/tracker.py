"""
Multi-Frame Persistence Tracker (ByteTrack-inspired association + Temporal Hysteresis).
Suppresses transient occlusion false positives by demanding infractions persist
across N >= 15 consecutive frames before firing an enterprise webhook alert.
"""

from typing import List, Dict, Any, Tuple
from detector import calculate_box_iou


class TrackedWorker:
    def __init__(self, track_id: int, initial_box: Tuple[int, int, int, int]):
        self.track_id = track_id
        self.box = initial_box
        self.disappeared_frames = 0
        self.consecutive_violations = {
            "NO_HELMET": 0,
            "NO_VEST": 0,
            "ZONE_INTRUSION": 0
        }
        self.alert_dispatched = {
            "NO_HELMET": False,
            "NO_VEST": False,
            "ZONE_INTRUSION": False
        }
        self.last_alert_frame = {
            "NO_HELMET": -9999,
            "NO_VEST": -9999,
            "ZONE_INTRUSION": -9999
        }

    def update_box(self, new_box: Tuple[int, int, int, int]):
        self.box = new_box
        self.disappeared_frames = 0


class PersistenceTracker:
    def __init__(self, hysteresis_frames: int = 15, alert_cooldown_frames: int = 150):
        self.hysteresis_threshold = hysteresis_frames
        self.cooldown_frames = alert_cooldown_frames
        self.next_track_id = 101
        self.tracks: Dict[int, TrackedWorker] = {}

    def update(self, detected_workers: List[Dict[str, Any]], frame_idx: int) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Associates detections with existing tracks using IOU matching.
        Evaluates temporal hysteresis for violations.
        Returns:
            (updated_detections_with_ids, confirmed_alerts_to_dispatch)
        """
        alerts_to_dispatch = []
        matched_track_ids = set()

        # Simple greedy IOU association
        for det in detected_workers:
            det_box = det["box"]
            best_iou = 0.25  # Minimum IOU threshold for identity persistence
            best_id = None

            for t_id, track in self.tracks.items():
                if t_id in matched_track_ids:
                    continue
                iou = calculate_box_iou(det_box, track.box)
                if iou > best_iou:
                    best_iou = iou
                    best_id = t_id

            if best_id is not None:
                track = self.tracks[best_id]
                track.update_box(det_box)
                matched_track_ids.add(best_id)
                det["track_id"] = best_id
            else:
                # Spawn new track
                new_id = self.next_track_id
                self.next_track_id += 1
                track = TrackedWorker(new_id, det_box)
                self.tracks[new_id] = track
                matched_track_ids.add(new_id)
                det["track_id"] = new_id

            # Evaluate violations with temporal hysteresis
            current_violations = set(det.get("violations", []))

            for v_type in ["NO_HELMET", "NO_VEST", "ZONE_INTRUSION"]:
                if v_type in current_violations:
                    track.consecutive_violations[v_type] += 1

                    # Trigger alert only if uncorrected over >= 15 consecutive frames
                    if track.consecutive_violations[v_type] >= self.hysteresis_threshold:
                        if not track.alert_dispatched[v_type] or (frame_idx - track.last_alert_frame[v_type] > self.cooldown_frames):
                            track.alert_dispatched[v_type] = True
                            track.last_alert_frame[v_type] = frame_idx
                            alerts_to_dispatch.append({
                                "workerTrackId": track.track_id,
                                "violationType": v_type,
                                "confidenceScore": det.get("confidence", 0.92),
                                "consecutiveFrames": track.consecutive_violations[v_type],
                                "box": det_box
                            })
                else:
                    # Violation corrected: reset counter and alert flag
                    track.consecutive_violations[v_type] = 0
                    track.alert_dispatched[v_type] = False

        # Cleanup lost tracks
        unmatched_ids = [t_id for t_id in self.tracks.keys() if t_id not in matched_track_ids]
        for t_id in unmatched_ids:
            self.tracks[t_id].disappeared_frames += 1
            if self.tracks[t_id].disappeared_frames > 40:
                del self.tracks[t_id]

        return detected_workers, alerts_to_dispatch
