"""
clinician_dashboard/service/constants.py
Static display metadata and risk evaluation thresholds.
"""

_DISEASE_META: dict[str, dict[str, str]] = {
    "cvd": {"display_name": "Cardiovascular Disease", "color_hint": "#EF4444"},
    "hyp": {"display_name": "Hypertension", "color_hint": "#F97316"},
    "chd": {"display_name": "Coronary Heart Disease", "color_hint": "#EAB308"},
    "stroke": {"display_name": "Stroke", "color_hint": "#8B5CF6"},
}

_RISK_THRESHOLDS: dict[str, tuple[float, float]] = {
    "stroke": (0.03, 0.07),
    "chd": (0.10, 0.20),
    "hyp": (0.30, 0.60),
    "cvd": (0.10, 0.20),
}
