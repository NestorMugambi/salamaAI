# predictions/diagnostics.py
import traceback
from typing import Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

# Import our lean internal modules
from . import registry, queries
from .service import _FEATURE_ENGINEERS


async def run_system_diagnostic(user_id: UUID, session: AsyncSession) -> dict:
    """Full system diagnostic — checks model files, data states, and engineering matrices without real inference."""
    report: dict[str, Any] = {
        "model_dir": str(registry.MODEL_DIR),
        "model_dir_exists": registry.MODEL_DIR.exists(),
        "model_files": {},
        "scaler_files": {},
        "profile": None,
        "latest_assessment": None,
        "blood_pressures": [],
        "feature_samples": {},
        "errors": [],
    }

    # 1. Verify File System Artifact States via Registry Bounds
    for disease, (filename, _) in registry.MODEL_PATHS.items():
        path = registry.MODEL_DIR / filename
        report["model_files"][disease] = {
            "path": str(path),
            "exists": path.exists(),
            "size_kb": round(path.stat().st_size / 1024, 1) if path.exists() else None,
        }

        scaler_file = registry.SCALER_PATHS.get(disease)
        if scaler_file:
            s_path = registry.MODEL_DIR / scaler_file
            report["scaler_files"][disease] = {
                "path": str(s_path),
                "exists": s_path.exists(),
                "size_kb": round(s_path.stat().st_size / 1024, 1)
                if s_path.exists()
                else None,
            }

    # 2. Extract Base Profiles Data
    profile = None
    assessment = None

    try:
        profile = await queries.fetch_user_profile(user_id, session)
        if profile:
            report["profile"] = {
                col.key: str(getattr(profile, col.key))
                for col in profile.__table__.columns
            }
        else:
            report["errors"].append("No UserProfile row found for this user.")
    except Exception as exc:
        report["errors"].append(f"Profile query error: {exc}")

    # 3. Extract Medical Assessment Data
    try:
        assessment = await queries.fetch_latest_assessment(user_id, session)
        if assessment:
            report["latest_assessment"] = {
                col.key: str(getattr(assessment, col.key))
                for col in assessment.__table__.columns
            }
            report["blood_pressures"] = [
                {
                    "systolic_value": bp.systolic_value,
                    "diastolic_value": bp.diastolic_value,
                    "start_date_time": str(getattr(bp, "start_date_time", None)),
                }
                for bp in (assessment.blood_pressures or [])
            ]
        else:
            report["errors"].append("No HealthAssessment row found for this user.")
    except Exception as exc:
        report["errors"].append(
            f"Assessment query error: {exc}\n{traceback.format_exc()}"
        )

    # 4. Dry-Run Feature Transformation Engines
    if profile and assessment:
        for disease, engineer_fn in _FEATURE_ENGINEERS.items():
            try:
                features = engineer_fn(profile, assessment)
                report["feature_samples"][disease] = {
                    "ok": True,
                    "features": features,
                    "n_features": len(features),
                }
            except Exception as exc:
                report["feature_samples"][disease] = {
                    "ok": False,
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                }

    return report
