from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel): 
    name : str
    email: EmailStr
    age: Optional[int] = None
    password: str


class UserResponse(BaseModel):
    id : int
    name: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password : str


class LoginResponse(BaseModel):
    message : str