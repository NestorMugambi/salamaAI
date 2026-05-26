import joblib
from pathlib import Path

# change this to your actual model path
MODEL_PATH = Path(r"fastapi_backend/app/models/xgbcvdv1.joblib")

model = joblib.load(MODEL_PATH)

print("\n=== MODEL INFO ===")
print("Model type:", type(model))
print("Expected features:", model.n_features_in_)
