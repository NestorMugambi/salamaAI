"""
clinician_dashboard/service/utils.py
Pure functional domain-agnostic or data serialization helpers.
"""

import re
from datetime import datetime, timezone
from app.models import User, UserProfile, RiskAssessmentResult
from app.clinician_dashboard.schemas import RiskCardSummary, PatientSummary
from .constants import _DISEASE_META, _RISK_THRESHOLDS


def _slug(first: str, last: str, license_number: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", f"{first}-{last}".lower()).strip("-")
    suffix = re.sub(r"[^a-z0-9]", "", license_number.lower())[-6:]
    return f"{base}-{suffix}"


def _overall_label(percent: float) -> str:
    if percent <= 30:
        return "Low"
    if percent <= 55:
        return "Moderate"
    return "High"


def _is_high_risk(results: list[RiskAssessmentResult]) -> bool:
    """True if any disease latest score exceeds its critical threshold."""
    latest: dict[str, RiskAssessmentResult] = {}
    for r in results:
        if r.disease not in latest or r.predicted_at > latest[r.disease].predicted_at:
            latest[r.disease] = r
    for disease, r in latest.items():
        _, high_floor = _RISK_THRESHOLDS.get(disease, (0.30, 0.60))
        if r.risk_score > high_floor:
            return True
    return False


def _build_risk_cards(
    results: list[RiskAssessmentResult],
) -> tuple[list[RiskCardSummary], float, str]:
    """Returns (cards, overall_percent, overall_label)."""
    latest: dict[str, RiskAssessmentResult] = {}
    for r in results:
        if r.disease not in latest or r.predicted_at > latest[r.disease].predicted_at:
            latest[r.disease] = r

    cards: list[RiskCardSummary] = []
    scores: list[float] = []
    for disease, meta in _DISEASE_META.items():
        r = latest.get(disease)
        score = round(r.risk_score, 4) if r else 0.0
        scores.append(score)
        cards.append(
            RiskCardSummary(
                disease=disease,
                display_name=meta["display_name"],
                risk_score=score,
                risk_label=r.risk_label if r else "No data",
                risk_percent=round(score * 100, 1),
                color_hint=meta["color_hint"],
                last_assessed=r.predicted_at if r else None,
            )
        )

    overall_pct = round((sum(scores) / len(scores)) * 100, 1) if scores else 0.0
    return cards, overall_pct, _overall_label(overall_pct)


def _patient_full_name(profile: UserProfile | None, user: User) -> str:
    if profile and getattr(profile, "first_name", None):
        parts = [profile.first_name, getattr(profile, "last_name", None)]
        return " ".join(p for p in parts if p)
    return str(user.email)


def _build_patient_summary(
    user: User,
    profile: UserProfile | None,
    results: list[RiskAssessmentResult],
    linked_since: datetime | None = None,
) -> PatientSummary:
    cards, overall_pct, overall_label = _build_risk_cards(results)
    last_assessed = max((r.predicted_at for r in results), default=None)

    age: int | None = None
    if profile and getattr(profile, "date_of_birth", None):
        dob = profile.date_of_birth
        today = datetime.now(timezone.utc)
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    return PatientSummary(
        user_id=user.id,
        full_name=_patient_full_name(profile, user),
        age=age,
        sex=str(getattr(profile, "sex", None) or ""),
        email=str(user.email),
        overall_risk_percent=overall_pct,
        overall_risk_label=overall_label,
        risk_cards=cards,
        last_assessed=last_assessed,
        linked_since=linked_since,
    )
