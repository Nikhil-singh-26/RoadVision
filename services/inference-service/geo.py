"""
Geolocation extraction from image EXIF data.
Optionally snaps to nearest road via Nominatim.
"""

from __future__ import annotations

import logging
from typing import Optional

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

import config
from schemas import GeoLocation

logger = logging.getLogger(__name__)


def _get_exif_data(image: Image.Image) -> dict:
    """Extract EXIF data as a readable dict."""
    exif_data = {}
    info = image._getexif()
    if info is None:
        return exif_data
    for tag_id, value in info.items():
        tag = TAGS.get(tag_id, tag_id)
        if tag == "GPSInfo":
            gps_data = {}
            for gps_tag_id in value:
                gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                gps_data[gps_tag] = value[gps_tag_id]
            exif_data[tag] = gps_data
        else:
            exif_data[tag] = value
    return exif_data


def _convert_to_degrees(value) -> float:
    """Convert GPS coordinates from DMS to decimal degrees."""
    d, m, s = value
    return float(d) + float(m) / 60.0 + float(s) / 3600.0


def extract_gps(image: Image.Image) -> Optional[GeoLocation]:
    """Extract GPS lat/lon from image EXIF. Returns None if not available."""
    try:
        exif = _get_exif_data(image)
        gps_info = exif.get("GPSInfo")
        if not gps_info:
            return None

        lat = _convert_to_degrees(gps_info.get("GPSLatitude", (0, 0, 0)))
        lon = _convert_to_degrees(gps_info.get("GPSLongitude", (0, 0, 0)))

        lat_ref = gps_info.get("GPSLatitudeRef", "N")
        lon_ref = gps_info.get("GPSLongitudeRef", "E")

        if lat_ref == "S":
            lat = -lat
        if lon_ref == "W":
            lon = -lon

        if lat == 0.0 and lon == 0.0:
            return None

        geo = GeoLocation(latitude=lat, longitude=lon)

        # Optional: snap to nearest road via Nominatim
        if config.NOMINATIM_ENABLED:
            geo = _snap_to_road(geo)

        return geo
    except Exception as e:
        logger.warning(f"EXIF GPS extraction failed: {e}")
        return None


def _snap_to_road(geo: GeoLocation) -> GeoLocation:
    """Reverse-geocode via Nominatim to get road name."""
    try:
        import requests

        resp = requests.get(
            f"{config.NOMINATIM_URL}/reverse",
            params={
                "lat": geo.latitude,
                "lon": geo.longitude,
                "format": "json",
                "zoom": 17,
            },
            headers={"User-Agent": "RoadVision-PotholeDetector/1.0"},
            timeout=5,
        )
        if resp.ok:
            data = resp.json()
            address = data.get("address", {})
            road = address.get("road") or address.get("highway") or address.get("pedestrian")
            if road:
                geo.road_name = road
    except Exception as e:
        logger.warning(f"Nominatim reverse geocode failed: {e}")
    return geo
