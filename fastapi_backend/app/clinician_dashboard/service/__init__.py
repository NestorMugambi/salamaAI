"""
clinician_dashboard/service/__init__.py

Aggregated Clean API Layer for the Clinician Dashboard Sub-domain.
"""

from .profile import (
    create_clinician_profile,
    get_my_profile,
    update_clinician_profile,
)
from .patient import (
    get_my_patients,
    get_patient_detail,
    search_patients,
)
from .appointment import (
    create_appointment,
    get_appointments,
    update_appointment,
)
from .prescription import (
    assign_prescription,
    get_prescriptions,
)

__all__ = [
    "create_clinician_profile",
    "get_my_profile",
    "update_clinician_profile",
    "get_my_patients",
    "get_patient_detail",
    "search_patients",
    "create_appointment",
    "get_appointments",
    "update_appointment",
    "assign_prescription",
    "get_prescriptions",
]
