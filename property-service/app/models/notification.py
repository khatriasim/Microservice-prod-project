from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict
from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base  # must be a DeclarativeBase subclass
class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Who receives it (the user id from your JWT / user system)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)

    # e.g. "property_created", "property_updated", "price_drop", "system"
    type: Mapped[str] = mapped_column(String(50), nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # Optional extra info, e.g. {"property_id": 12}
    data: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_notifications_user_read_created", "user_id", "is_read", "created_at"),
    )


