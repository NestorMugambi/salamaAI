"""drop all tables

Revision ID: 0e0e6223d2f3
Revises: 0bf113c27733
Create Date: 2026-03-24 01:45:47.798172

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import fastapi_users_db_sqlalchemy


# revision identifiers, used by Alembic.
revision: str = "0e0e6223d2f3"
down_revision: Union[str, None] = "0bf113c27733"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table("doseschedule")
    op.drop_table("prescription")
    op.drop_table("heartrate")
    op.drop_table("bloodpressure")
    op.drop_table("items")
    op.drop_table("user")


def downgrade() -> None:
    pass
