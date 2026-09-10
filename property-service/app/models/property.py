from sqlalchemy import Column, Integer , String, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Property(Base):
    __tablename__ =  "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    area = Column(Float, nullable=True)
    city = Column(String, nullable=False)
    address = Column(String, nullable=True)
    property_type = Column(String, nullable=False, default="apartment")
    status = Column(String, nullable=False, default="available")
    agent_user_id = Column("agent_id", Integer, nullable=False, index=True)
    # agent = relationship("User", back_populates="properties")
    bookings = relationship("Booking", back_populates="property")
    agent_name = Column(String, nullable=True)
    agent_email = Column(String, nullable=True)
