import strawberry
from strawberry.types import Info
from app.graphql.types.booking import BookingType, CreateBookingInput
from app.core.database import SessionLocal
from app.models.booking import Booking
from app.models.property import Property
from app.models.user import User
from datetime import datetime
from typing import Optional

@strawberry.type
class BookingMutation:

    @strawberry.mutation
    def book_viewing(self, info: Info, input: CreateBookingInput) -> BookingType:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            prop = db.query(Property).filter(Property.id == input.property_id).first()
            if not prop:
                raise ValueError("Property not found")

            # don't double-book — return the user's existing booking for this property
            existing = db.query(Booking).filter(
                Booking.property_id == input.property_id,
                Booking.buyer_id == int(user_id),
            ).first()
            if existing:
                return BookingType(
                    id=existing.id,
                    property_id=existing.property_id,
                    buyer_id=existing.buyer_id,
                    booking_date=str(existing.booking_date),
                    status=existing.status,
                    property_title=existing.property.title if existing.property else None,
                    buyer_name=existing.booker_name or existing.buyer_id,
                )

            booking_date_str = input.booking_date if input.booking_date else None
            booking_date_dt = datetime.fromisoformat(booking_date_str) if booking_date_str else datetime.now()

            new_booking = Booking(
                property_id=input.property_id,
                buyer_id=int(user_id),
                booker_name=info.context.get("user_name") or info.context.get("user_email") or "Unknown",
                booking_date=booking_date_dt,
                status="pending",
            )

            db.add(new_booking)
            db.commit()
            db.refresh(new_booking)

            return BookingType(
                id=new_booking.id,
                property_id=new_booking.property_id,
                buyer_id=new_booking.buyer_id,
                booking_date=str(new_booking.booking_date),
                status=new_booking.status,
                property_title=new_booking.property.title,
                buyer_name=new_booking.booker_name or new_booking.buyer_id,
            )
        finally:
            db.close()

    @strawberry.mutation
    def cancel_booking(self, info: Info, id: int) -> bool:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            booking = db.query(Booking).filter(Booking.id == id).first()
            if not booking:
                raise Exception("Booking not found")
            if booking.buyer_id != int(user_id):
                raise Exception("Not your booking")

            db.delete(booking)
            db.commit()
            return True
        finally:
            db.close()

    @strawberry.mutation
    def update_booking(self, info: Info, id: int, booking_date: Optional[str] = None) -> Optional[BookingType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            booking = db.query(Booking).filter(Booking.id == id).first()
            if not booking:
                return None
            if booking.buyer_id != int(user_id):
                raise Exception("Not your booking")
            if booking_date is not None:
                booking_date = booking_date.strip()
                if booking_date:
                    # accept "YYYY-MM-DDTHH:MM" from datetime-local input
                    try:
                        booking.booking_date = datetime.fromisoformat(booking_date)
                    except ValueError:
                        raise Exception(f"Invalid date format: {booking_date}")
            db.commit()
            db.refresh(booking)
            return BookingType(
                id=booking.id,
                property_id=booking.property_id,
                buyer_id=booking.buyer_id,
                booking_date=str(booking.booking_date),
                status=booking.status,
                property_title=booking.property.title,
                buyer_name=booking.booker_name or booking.buyer_id,
            )
        finally:
            db.close()

    @strawberry.mutation
    def update_booking_status(self, info: Info, id: int, status: str) -> Optional[BookingType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            booking = db.query(Booking).filter(Booking.id == id).first()
            if not booking:
                return None

            # only the property's agent should be able to change booking status
            if booking.property.agent_user_id != int(user_id):
                raise Exception("Not your property's booking")

            booking.status = status
            db.commit()
            db.refresh(booking)

            return BookingType(
                id=booking.id,
                property_id=booking.property_id,
                buyer_id=booking.buyer_id,
                booking_date=str(booking.booking_date),
                status=booking.status,
                property_title=booking.property.title,
                buyer_name=booking.booker_name or booking.buyer_id,
            )
        finally:
            db.close()
