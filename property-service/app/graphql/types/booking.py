import strawberry
from typing import Optional

@strawberry.type
class BookingType:
    id: int
    property_id: int
    buyer_id: int
    booking_date: str
    status: str
    property_title: Optional[str] = None
    buyer_name: Optional[str] = None

@strawberry.input
class CreateBookingInput:
    property_id: int
    buyer_id: int
    booking_date: str  