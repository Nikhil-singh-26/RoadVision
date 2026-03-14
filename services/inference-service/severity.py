"""
Severity scoring algorithm.

Combines bounding-box relative size and detection confidence
to produce a 0-100 score and a categorical level.
All weights / thresholds are configurable via config.py.
"""

from __future__ import annotations

from typing import Tuple

import config


def score_pothole(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    confidence: float,
    image_width: int,
    image_height: int,
) -> Tuple[int, str]:
    """
    Returns (severity_score: 0-100, severity_level: low|medium|high).
    """
    # Relative area of the bounding box vs full image
    bbox_area = abs((x2 - x1) * (y2 - y1))
    image_area = image_width * image_height
    relative_area = bbox_area / image_area if image_area > 0 else 0

    # Normalize relative area to 0-100  (cap at 0.25 of image = max)
    area_score = min(relative_area / 0.25, 1.0) * 100

    # Confidence is already 0-1, map to 0-100
    conf_score = confidence * 100

    # Weighted combination
    score = int(
        config.SEVERITY_BBOX_WEIGHT * area_score
        + config.SEVERITY_CONF_WEIGHT * conf_score
    )
    score = max(0, min(100, score))

    # Map to category
    if score >= config.SEVERITY_HIGH_THRESHOLD:
        level = "high"
    elif score >= config.SEVERITY_MEDIUM_THRESHOLD:
        level = "medium"
    else:
        level = "low"

    return score, level
