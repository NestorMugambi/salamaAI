"""init

Revision ID: 645b60e4a1ee
Revises: ab96be423efa
Create Date: 2026-03-24 02:11:56.776305

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import fastapi_users_db_sqlalchemy


# revision identifiers, used by Alembic.
revision: str = "645b60e4a1ee"
down_revision: Union[str, None] = "ab96be423efa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
