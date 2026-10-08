"""Add Notification table (modern SQLAlchemy 2.0 style)

Revision ID: 5d20d115226c
Revises: 9d5f21b8c4e7
Create Date: 2026-10-08 11:04:34.193216

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5d20d115226c'
down_revision: Union[str, Sequence[str], None] = '9d5f21b8c4e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the notification table
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_notifications')),
        sa.Index('ix_notifications_user_read_created', 'user_id', 'is_read', 'created_at')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_notifications_user_read_created', table_name='notifications')
    op.drop_table('notifications')
