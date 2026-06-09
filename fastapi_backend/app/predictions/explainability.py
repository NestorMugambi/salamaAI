# predictions/explainability.py
import json
import logging
import time
from typing import Any, List
import numpy as np
import pandas as pd
import shap

from app.models import RiskAssessmentExplainability

logger = logging.getLogger(__name__)

class SHAPExplainabilityEngine:
    """
    Optimized Explainer Engine specifically tailored for Tree-based models (XGBoost, etc.).
    Leverages TreeSHAP for rapid, exact local feature attribution computations.
    """

    @classmethod
    def calculate_explainability(
        cls,
        model: Any,
        feature_input: pd.DataFrame,
        feature_names: List[str],
        risk_assessment_id: Any,
        top_n_factors: int = 3
    ) -> RiskAssessmentExplainability:
        """
        Computes exact TreeSHAP values for an inference instance, extracts top positive 
        risk drivers, and maps them directly to the database model schema.
        """
        start_time = time.perf_counter()
        
        try:
            # 1. Instantiate the optimized TreeExplainer
            explainer = shap.TreeExplainer(model)
            
            # 2. Compute exact SHAP values
            shap_output = explainer(feature_input)

            # Extract raw values based on SHAP output type formatting
            if hasattr(shap_output, "values"):
                raw_shap_values = shap_output.values
            else:
                raw_shap_values = shap_output

            # Handle binary classification outputs for Tree models:
            # - If output is 3D or 2D array per class probabilities, extract positive class (index 1)
            # - For standard XGBoost logit/margin outputs, it's typically a 1D/2D single array
            if len(raw_shap_values.shape) == 3 and raw_shap_values.shape[2] == 2:
                instance_shap = raw_shap_values[0, :, 1]
            elif len(raw_shap_values.shape) == 2 and raw_shap_values.shape[1] == 2:
                instance_shap = raw_shap_values[0, 1]
            elif len(raw_shap_values.shape) == 2:
                instance_shap = raw_shap_values[0]
            else:
                instance_shap = raw_shap_values

            # 3. Map values to structural feature names
            shap_dict = {
                name: float(val) for name, val in zip(feature_names, instance_shap)
            }

            # 4. Extract Top Risk Factors (filter only for positive push towards the disease)
            sorted_factors = sorted(shap_dict.items(), key=lambda x: x[1], reverse=True)
            top_factors_list = [
                {"feature": feat, "shap_value": round(val, 4)}
                for feat, val in sorted_factors if val > 0
            ][:top_n_factors]

            # 5. Domain Knowledge Mapping Layer for automated Clinical Insights
            recommendations = []
            clinical_notes = []
            
            for item in top_factors_list:
                feat = item["feature"].lower()
                if any(x in feat for x in ["bp", "blood_pressure", "sys", "dia"]):
                    recommendations.append("Prioritize cardiovascular monitoring and blood pressure regulation protocols.")
                    clinical_notes.append("Elevated blood pressure metrics actively inflated the risk profile.")
                elif "chol" in feat or "lipid" in feat:
                    recommendations.append("Consider lipid-lowering medical evaluation or structural lifestyle adjustments.")
                    clinical_notes.append("Hyperlipidemia metrics flagged as a core risk driver.")
                elif "bmi" in feat or "weight" in feat:
                    recommendations.append("Provide metabolic health coaching, structural nutritional guidance, and activity tracking.")
                    clinical_notes.append("Elevated Body Mass Index scales up susceptibility bounds.")
                elif "age" in feat:
                    clinical_notes.append("Demographic age index acts as a baseline accelerating factor.")

            # Hard fallbacks if non-mapped features are driving the prediction
            if not recommendations:
                recommendations.append("Routine preventative clinical screening and risk factor mitigation advised.")
            if not clinical_notes:
                clinical_notes.append("Risk assignment driven by compounding multi-factor tree-split contributions.")

            inference_time_ms = (time.perf_counter() - start_time) * 1000

            return RiskAssessmentExplainability(
                risk_assessment_id=risk_assessment_id,
                top_risk_factors=json.dumps(top_factors_list),
                recommendation=" ".join(list(set(recommendations))),
                clinical_summary=" ".join(clinical_notes),
                shap_values=json.dumps(shap_dict),
                lime_explanation=None,
                inference_time_ms=round(inference_time_ms, 2)
            )

        except Exception as e:
            logger.error(f"TreeSHAP pipeline exception on risk_id {risk_assessment_id}: {str(e)}")
            return RiskAssessmentExplainability(
                risk_assessment_id=risk_assessment_id,
                clinical_summary=f"TreeSHAP engine generation failure: {str(e)}",
                inference_time_ms=round((time.perf_counter() - start_time) * 1000, 2)
            )