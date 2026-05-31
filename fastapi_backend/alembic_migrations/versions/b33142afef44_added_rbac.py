"""added RBAC

Revision ID: b33142afef44
Revises: 3e424707d4a3
Create Date: 2026-05-29 22:41:51.936403
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = 'b33142afef44'
down_revision: Union[str, None] = '3e424707d4a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define enum explicitly
user_role_enum = sa.Enum(
    "PATIENT",
    "CLINICIAN",
    "ADMIN",
    name="user_role",
)


def upgrade() -> None:
    # 1. Create enum type FIRST
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add column
    op.add_column(
        "user",
        sa.Column(
            "role",
            user_role_enum,
            nullable=False,
            server_default="PATIENT",
        ),
    )


def downgrade() -> None:
    # 1. Drop column first
    op.drop_column("user", "role")

    # 2. Drop enum type
    user_role_enum = sa.Enum(name="user_role")
    user_role_enum.drop(op.get_bind(), checkfirst=True)