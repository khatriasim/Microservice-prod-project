# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

# This is like Django's models.py
class User(Base):
    __tablename__ = "users"         # the actual table name in DB

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
