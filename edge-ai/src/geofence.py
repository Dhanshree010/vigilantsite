"""
Geo-Fencing and Danger Zone Evaluation Module.
Enforces physical perimeter compliance using Shapely polygon intersections
with built-in Ray-Casting fallback.
"""

from typing import List, Tuple, Dict, Any

try:
    from shapely.geometry import Point, Polygon
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False


class DangerZone:
    def __init__(self, zone_id: str, name: str, polygon_coords: List[Dict[str, float]], danger_level: str = "CRITICAL"):
        """
        :param polygon_coords: List of {'x': float, 'y': float} normalized [0..1]
        """
        self.zone_id = zone_id
        self.name = name
        self.danger_level = danger_level
        self.coords = polygon_coords
        self.points_list = [(p["x"], p["y"]) for p in polygon_coords]

        if HAS_SHAPELY and len(self.points_list) >= 3:
            self.shapely_polygon = Polygon(self.points_list)
        else:
            self.shapely_polygon = None

    def contains_point(self, nx: float, ny: float) -> bool:
        """
        Checks if normalized coordinate (nx, ny) is inside the polygon.
        Uses Shapely if available, else standard ray-casting algorithm.
        """
        if self.shapely_polygon is not None:
            return self.shapely_polygon.contains(Point(nx, ny))

        # Ray-casting point-in-polygon algorithm
        n = len(self.points_list)
        inside = False
        p1x, p1y = self.points_list[0]
        for i in range(n + 1):
            p2x, p2y = self.points_list[i % n]
            if ny > min(p1y, p2y):
                if ny <= max(p1y, p2y):
                    if nx <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (ny - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or nx <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside

    def check_worker_intrusion(self, bbox: Tuple[int, int, int, int], frame_width: int, frame_height: int) -> bool:
        """
        Checks if worker's ground contact point (bottom-center of bounding box)
        intrudes into this danger zone.
        bbox: (x1, y1, x2, y2)
        """
        x1, y1, x2, y2 = bbox
        foot_x = (x1 + x2) / 2.0
        foot_y = float(y2)

        # Normalize to 0.0 - 1.0
        nx = foot_x / max(frame_width, 1)
        ny = foot_y / max(frame_height, 1)

        return self.contains_point(nx, ny)


class GeoFenceManager:
    def __init__(self):
        self.zones: List[DangerZone] = []

    def add_zone(self, zone_id: str, name: str, polygon_coords: List[Dict[str, float]], danger_level: str = "CRITICAL"):
        zone = DangerZone(zone_id, name, polygon_coords, danger_level)
        self.zones.append(zone)

    def evaluate_worker(self, bbox: Tuple[int, int, int, int], frame_w: int, frame_h: int) -> List[DangerZone]:
        """
        Returns all danger zones the worker is currently penetrating.
        """
        breached_zones = []
        for zone in self.zones:
            if zone.check_worker_intrusion(bbox, frame_w, frame_h):
                breached_zones.append(zone)
        return breached_zones
