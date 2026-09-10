import strawberry
from typing import Optional
@strawberry.type
class PropertyType:
    id: int
    title: str
    price : float
    city: str
    status: str
    agent_id: int
    agent_name : Optional[str] = None
    description: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    address: Optional[str] = None



@strawberry.input
class CreatePropertyInput:
    title: str
    price: float
    city: str
    property_type: str = "apartment"
    description: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    address: Optional[str] = None


@strawberry.input
class UpdatePropertyInput:
    title: Optional[str] = None
    price: Optional[float] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    address: Optional[str] = None