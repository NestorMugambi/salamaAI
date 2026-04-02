"""init medical db

Revision ID: ab96be423efa
Revises: 0e0e6223d2f3
Create Date: 2026-03-24 02:04:28.338112

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "ab96be423efa"
down_revision: Union[str, None] = "0e0e6223d2f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
