from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    buyer_id = Column(Integer, nullable=False)
    booking_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="pending")
    property = relationship("Property", back_populates="bookings")
    # buyer = relationship("User", back_populates="bookings")