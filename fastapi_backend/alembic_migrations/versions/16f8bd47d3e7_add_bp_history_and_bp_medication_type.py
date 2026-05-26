"""add bp history and bp medication type

Revision ID: 16f8bd47d3e7
Revises: 3aba49888d60
Create Date: 2026-05-23 14:14:12.117597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "16f8bd47d3e7"
down_revision: Union[str, None] = "3aba49888d60"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Define and explicitly create the custom Enum types for PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Create 'bpmedication' type
        bp_med_enum = sa.Enum(
            "NONE",
            "BETA_BLOCKER",
            "DIURETIC",
            "ACE_INHIBITOR",
            "OTHER",
            name="bpmedication",
        )
        bp_med_enum.create(bind, checkfirst=True)

        # Create 'bphistory' type
        bp_hist_enum = sa.Enum(
            "NORMAL", "PREHYPERTENSION", "HYPERTENSION", name="bphistory"
        )
        bp_hist_enum.create(bind, checkfirst=True)

    # 2. Add 'bp_medication_type' column with a fallback server_default
    op.add_column(
        "health_assessment",
        sa.Column(
            "bp_medication_type",
            sa.Enum(
                "NONE",
                "BETA_BLOCKER",
                "DIURETIC",
                "ACE_INHIBITOR",
                "OTHER",
                name="bpmedication",
            ),
            nullable=False,
            server_default="NONE",
        ),
    )

    # 3. Add 'bp_history' column with a fallback server_default
    op.add_column(
        "user_profile",
        sa.Column(
            "bp_history",
            sa.Enum("NORMAL", "PREHYPERTENSION", "HYPERTENSION", name="bphistory"),
            nullable=False,
            server_default="NORMAL",
        ),
    )

    # 4. Clean up the server defaults so the app code handles future defaults, not the database layer
    op.alter_column("health_assessment", "bp_medication_type", server_default=None)
    op.alter_column("user_profile", "bp_history", server_default=None)


def downgrade() -> None:
    # 1. Drop columns first
    op.drop_column("user_profile", "bp_history")
    op.drop_column("health_assessment", "bp_medication_type")

    # 2. Drop the custom types from PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        sa.Enum(name="bpmedication").drop(bind, checkfirst=True)
        sa.Enum(name="bphistory").drop(bind, checkfirst=True)
