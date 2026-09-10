"""remove local user foreign key from properties

Revision ID: 7c3e1a4f9b20
Revises: 2a9ad517e2d8
Create Date: 2026-09-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c3e1a4f9b20"
down_revision: Union[str, Sequence[str], None] = "2a9ad517e2d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("properties_agent_id_fkey", "properties", type_="foreignkey")


def downgrade() -> None:
    op.create_foreign_key(
        "properties_agent_id_fkey",
        "properties",
        "users",
        ["agent_id"],
        ["id"],
    )
