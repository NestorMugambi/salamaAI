from fastapi.routing import APIRoute
from datetime import date
import math

def simple_generate_unique_route_id(route: APIRoute):
    return f"{route.tags[0]}-{route.name}"


def calculate_age(date_of_birth: date) -> int:
    today = date.today()
    return (
        today.year
        - date_of_birth.year
        - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    )

# ──────────────────────────────────────────────
# BMI utility functions
# ──────────────────────────────────────────────
def compute_bmi(weight: float, height: float) -> float:
    """Calculate BMI = weight (kg) / height (m)^2."""
    if height <= 0:
        raise ValueError("Height must be positive")
    return weight / (height ** 2)


def compute_log_bmi(bmi: float) -> float:
    """Natural log of BMI."""
    if bmi <= 0:
        raise ValueError("BMI must be positive")
    return math.log(bmi)
