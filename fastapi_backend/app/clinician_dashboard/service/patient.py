"""
clinician_dashboard/service/patient.py
Patient operations, tracking, filtering lists, and deep analytical profile lookup.
"""

from uuid import UUID
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    ClinicianPatient,
    User,
    UserProfile,
    HealthAssessment,
    RiskAssessmentResult,
)
from app.clinician_dashboard.schemas import (
    HighRiskPatientResponse,
    PatientSummary,
    PatientDetailResponse,
    UserProfileRead,
    HealthAssessmentSummary,
    PatientSearchResponse,
)
from .base_db import (
    _require_clinician,
    _patient_users,
    _patient_profiles,
    _patient_risk_results,
)
from .utils import _build_patient_summary, _build_risk_cards, _patient_full_name


async def get_my_patients(
    clinician_user_id: UUID,
    session: AsyncSession,
    risk_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> HighRiskPatientResponse:
    cp = await _require_clinician(clinician_user_id, session)

    links_result = await session.execute(
        select(ClinicianPatient).where(ClinicianPatient.clinician_profile_id == cp.id)
    )
    links = links_result.scalars().all()
    patient_ids = [lnk.patient_id for lnk in links]
    link_dates = {lnk.patient_id: lnk.created_at for lnk in links}

    if not patient_ids:
        return HighRiskPatientResponse(total=0, patients=[])

    users = await _patient_users(patient_ids, session)
    profiles = await _patient_profiles(patient_ids, session)
    results = await _patient_risk_results(patient_ids, session)

    summaries: list[PatientSummary] = []
    for pid in patient_ids:
        user = users.get(pid)
        profile = profiles.get(pid)
        if not user:
            continue
        summary = _build_patient_summary(
            user, profile, results.get(pid, []), link_dates.get(pid)
        )
        if risk_filter:
            if summary.overall_risk_label.lower() != risk_filter.lower():
                continue
        summaries.append(summary)

    summaries.sort(key=lambda s: s.overall_risk_percent, reverse=True)

    total = len(summaries)
    offset = (page - 1) * page_size
    page_items = summaries[offset : offset + page_size]

    return HighRiskPatientResponse(total=total, patients=page_items)


async def get_patient_detail(
    clinician_user_id: UUID,
    patient_id: UUID,
    session: AsyncSession,
) -> PatientDetailResponse:
    cp = await _require_clinician(clinician_user_id, session)

    link = await session.execute(
        select(ClinicianPatient).where(
            and_(
                ClinicianPatient.clinician_profile_id == cp.id,
                ClinicianPatient.patient_id == patient_id,
            )
        )
    )
    if not link.scalar_one_or_none():
        raise PermissionError("Patient is not linked to your practice.")

    user_row = await session.execute(select(User).where(User.id == patient_id))
    user: User | None = user_row.scalar_one_or_none()
    if not user:
        raise ValueError("Patient not found.")

    profile_row = await session.execute(
        select(UserProfile).where(UserProfile.user_id == patient_id)
    )
    profile: UserProfile | None = profile_row.scalar_one_or_none()

    assessment_row = await session.execute(
        select(HealthAssessment)
        .where(HealthAssessment.user_id == patient_id)
        .order_by(HealthAssessment.created_at.desc())
        .limit(1)
        .options(
            selectinload(HealthAssessment.blood_pressures),
            selectinload(HealthAssessment.heart_rates),
        )
    )
    latest_assessment: HealthAssessment | None = assessment_row.scalar_one_or_none()

    count_row = await session.execute(
        select(func.count()).where(HealthAssessment.user_id == patient_id)
    )
    assessment_count: int = count_row.scalar_one()

    results_row = await session.execute(
        select(RiskAssessmentResult).where(RiskAssessmentResult.user_id == patient_id)
    )
    results = results_row.scalars().all()
    cards, overall_pct, overall_label = _build_risk_cards(list(results))

    assessment_schema: HealthAssessmentSummary | None = None
    if latest_assessment:
        from clinician_dashboard.schemas import BloodPressureRead

        bps = [
            BloodPressureRead(
                systolic_value=bp.systolic_value,
                diastolic_value=bp.diastolic_value,
                start_date_time=bp.start_date_time,
            )
            for bp in sorted(
                latest_assessment.blood_pressures or [],
                key=lambda b: b.start_date_time,
                reverse=True,
            )
        ]
        assessment_schema = HealthAssessmentSummary(
            id=latest_assessment.id,
            created_at=latest_assessment.created_at,
            weight=latest_assessment.weight,
            height=latest_assessment.height,
            bmi=latest_assessment.bmi,
            glucose=latest_assessment.glucose,
            avg_glucose_level=latest_assessment.avg_glucose_level,
            total_cholesterol=latest_assessment.total_cholesterol,
            hdl_cholesterol=latest_assessment.hdl_cholesterol,
            on_bp_medication=latest_assessment.on_bp_medication,
            smoking_status=str(latest_assessment.smoking_status.value)
            if latest_assessment.smoking_status
            else None,
            alcohol_use=str(latest_assessment.alcohol_use.value)
            if latest_assessment.alcohol_use
            else None,
            physical_activity_level=str(latest_assessment.physical_activity_level.value)
            if latest_assessment.physical_activity_level
            else None,
            assessment_notes=latest_assessment.assessment_notes,
            blood_pressures=bps,
        )

    profile_schema: UserProfileRead | None = (
        UserProfileRead.model_validate(profile) if profile else None
    )

    return PatientDetailResponse(
        user_id=user.id,
        email=str(user.email),
        profile=profile_schema,
        latest_assessment=assessment_schema,
        assessment_count=assessment_count,
        risk_cards=cards,
        overall_risk_percent=overall_pct,
        overall_risk_label=overall_label,
    )


async def search_patients(
    clinician_user_id: UUID,
    query: str,
    session: AsyncSession,
) -> PatientSearchResponse:
    cp = await _require_clinician(clinician_user_id, session)

    links_result = await session.execute(
        select(ClinicianPatient).where(ClinicianPatient.clinician_profile_id == cp.id)
    )
    links = links_result.scalars().all()
    patient_ids = [lnk.patient_id for lnk in links]
    link_dates = {lnk.patient_id: lnk.created_at for lnk in links}

    if not patient_ids:
        return PatientSearchResponse(query=query, total=0, results=[])

    q = query.strip().lower()

    user_rows = await session.execute(
        select(User).where(
            and_(
                User.id.in_(patient_ids),
                User.email.ilike(f"%{q}%"),
            )
        )
    )
    matched_by_email = {u.id for u in user_rows.scalars().all()}

    profile_rows = await session.execute(
        select(UserProfile).where(
            and_(
                UserProfile.user_id.in_(patient_ids),
                or_(
                    UserProfile.first_name.ilike(f"%{q}%"),
                    UserProfile.last_name.ilike(f"%{q}%"),
                ),
            )
        )
    )
    profile_map: dict[UUID, UserProfile] = {}
    matched_by_name: set[UUID] = set()
    for p in profile_rows.scalars().all():
        profile_map[p.user_id] = p
        matched_by_name.add(p.user_id)

    matched_ids = list(matched_by_email | matched_by_name)
    if not matched_ids:
        return PatientSearchResponse(query=query, total=0, results=[])

    users = await _patient_users(matched_ids, session)
    profiles_full = await _patient_profiles(matched_ids, session)
    profiles_full.update(profile_map)
    results = await _patient_risk_results(matched_ids, session)

    summaries = [
        _build_patient_summary(
            users[pid],
            profiles_full.get(pid),
            results.get(pid, []),
            link_dates.get(pid),
        )
        for pid in matched_ids
        if pid in users
    ]
    summaries.sort(key=lambda s: s.overall_risk_percent, reverse=True)

    return PatientSearchResponse(query=query, total=len(summaries), results=summaries)
