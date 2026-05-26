from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime
from uuid import UUID


# ─── Request Schemas ──────────────────────────────────────────────────────────


class PredictionRequest(BaseModel):
    """Trigger predictions for one or all diseases for the current user."""

    diseases: Optional[list[str]] = Field(
        default=None,
        description="Subset of ['cvd', 'hyp', 'chd', 'stroke']. None = run all.",
    )


# ─── Individual Result Schemas ────────────────────────────────────────────────


class DiseasePredictionResult(BaseModel):
    disease: str
    risk_score: float = Field(..., description="Probability / risk score [0-1]")
    risk_label: str = Field(..., description="'Low' | 'Moderate' | 'High'")
    model_version: str
    features_used: dict


class PredictionError(BaseModel):
    """Details of a per-disease failure — returned alongside partial results."""

    disease: str
    stage: str = Field(
        description="'feature_engineering' | 'model_load' | 'inference' | 'persistence'"
    )
    error: str
    features_used: Optional[dict[str, Any]] = None


class PredictionResponse(BaseModel):
    user_id: UUID
    predicted_at: datetime
    results: list[DiseasePredictionResult]
    errors: list[PredictionError] = Field(
        default_factory=list,
        description="Partial failures — populated when one or more diseases failed. Empty on full success.",
    )


# ─── Stored Result Read Schema ─────────────────────────────────────────────────


class RiskAssessmentResultRead(BaseModel):
    id: UUID
    user_id: UUID
    disease: str
    risk_score: float
    risk_label: str
    model_version: str
    predicted_at: datetime

    class Config:
        from_attributes = True
