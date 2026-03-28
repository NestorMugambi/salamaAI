"""health records

Revision ID: 653ff915b0a2
Revises: 645b60e4a1ee
Create Date: 2026-03-24 02:30:34.975962

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import fastapi_users_db_sqlalchemy


# revision identifiers, used by Alembic.
revision: str = '653ff915b0a2'
down_revision: Union[str, None] = '645b60e4a1ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
