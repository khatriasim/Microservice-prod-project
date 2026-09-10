"""add agent identity snapshot to properties

Revision ID: 9d5f21b8c4e7
Revises: 7c3e1a4f9b20
Create Date: 2026-09-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9d5f21b8c4e7"
down_revision: Union[str, Sequence[str], None] = "7c3e1a4f9b20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("properties", sa.Column("agent_name", sa.String(), nullable=True))
    op.add_column("properties", sa.Column("agent_email", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("properties", "agent_email")
    op.drop_column("properties", "agent_name")
