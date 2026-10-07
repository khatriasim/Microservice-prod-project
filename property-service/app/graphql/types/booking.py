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
    buyer_id: Optional[int] = None  # optional — the mutation always uses the authenticated user id
    # A viewing must always use the date and time selected by the buyer.
    booking_date: str
