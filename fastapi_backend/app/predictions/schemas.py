import json
from pydantic import BaseModel, Field, computed_field
from typing import Any, Optional, List, Dict
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
class RiskAssessmentExplainabilityRead(BaseModel):
    id: UUID
    risk_assessment_id: UUID
    recommendation: Optional[str] = None
    clinical_summary: Optional[str] = None
    lime_explanation: Optional[str] = None
    inference_time_ms: Optional[float] = None
    
    # Hidden from serialization context so our computed fields can format them nicely
    top_risk_factors: Optional[str] = Field(None, exclude=True)
    shap_values: Optional[str] = Field(None, exclude=True)

    model_config = {
        "from_attributes": True
    }

    # Automatically unrolls JSON string attributes to native objects in responses
    @computed_field
    def parsed_top_risk_factors(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.top_risk_factors) if self.top_risk_factors else []
        except Exception:
            return []

    @computed_field
    def parsed_shap_values(self) -> Dict[str, float]:
        try:
            return json.loads(self.shap_values) if self.shap_values else {}
        except Exception:
            return {}


class RiskAssessmentResultRead(BaseModel):
    id: UUID
    user_id: UUID
    disease: str
    risk_score: float
    risk_percentage: float
    risk_label: str
    model_version: str
    predicted_at: datetime
    
    # 1:1 Embedded Nested Model Execution Context mapping
    explainability: Optional[RiskAssessmentExplainabilityRead] = None

    model_config = {
        "from_attributes": True
    }