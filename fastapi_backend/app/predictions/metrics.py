# predictions/metrics.py

RISK_THRESHOLDS = {
    "stroke": (0.03, 0.07),
    "chd": (0.10, 0.20),
    "hyp": (0.30, 0.60),
    "cvd": (0.10, 0.20),
}


def calculate_risk_percentage(score: float) -> float:
    return round(score * 100.0, 2)


def determine_risk_label(score: float, disease: str) -> str:
    low_ceil, high_floor = RISK_THRESHOLDS.get(disease, (0.30, 0.60))
    if score <= low_ceil:
        return "Low"
    if score <= high_floor:
        return "Moderate"
    return "High"
