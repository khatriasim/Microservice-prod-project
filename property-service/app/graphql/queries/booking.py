import strawberry
from strawberry.types import Info
from typing import List, Optional
from app.graphql.types.booking import BookingType
from app.core.database import SessionLocal
from app.models.booking import Booking

@strawberry.type
class BookingQuery:

    @strawberry.field
    def my_bookings(self, info: Info) -> List[BookingType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            bookings = db.query(Booking).filter(Booking.buyer_id == int(user_id)).all()
            return [
                BookingType(
                    id=b.id,
                    property_id=b.property_id,
                    buyer_id=b.buyer_id,
                    booking_date=str(b.booking_date),
                    status=b.status,
                    property_title=b.property.title,
                    buyer_name=None,  # no local user table anymore — see note below
                )
                for b in bookings
            ]
        finally:
            db.close()

    @strawberry.field
    def property_bookings(self, info: Info, property_id: int) -> List[BookingType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            bookings = db.query(Booking).filter(Booking.property_id == property_id).all()

            # only the property's agent should see who booked their listing
            if bookings and bookings[0].property.agent_user_id != int(user_id):
                raise Exception("Not your property")

            return [
                BookingType(
                    id=b.id,
                    property_id=b.property_id,
                    buyer_id=b.buyer_id,
                    booking_date=str(b.booking_date),
                    status=b.status,
                    property_title=b.property.title,
                    buyer_name=None,  # no local user table anymore — see note below
                )
                for b in bookings
            ]
        finally:
            db.close()
