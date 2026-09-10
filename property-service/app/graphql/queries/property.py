import strawberry
from strawberry.types import Info
from typing import List, Optional
from app.graphql.types.property import PropertyType
from app.core.database import SessionLocal
from app.models.property import Property

@strawberry.type
class PropertyQuery:

    @strawberry.field
    def properties(self,
                   city: Optional[str] = None,
                   min_price: Optional[float] = None,
                   max_price: Optional[float] = None,
                   bedrooms: Optional[int] = None,
                   property_type: Optional[str] = None,
                   ) -> List[PropertyType]:
        db = SessionLocal()
        try:
            query = db.query(Property)

            if city:
                query = query.filter(Property.city == city)
            if min_price:
                query = query.filter(Property.price >= min_price)
            if max_price:
                query = query.filter(Property.price <= max_price)
            if bedrooms:
                query = query.filter(Property.bedrooms == bedrooms)
            if property_type:
                query = query.filter(Property.property_type == property_type)
            # agent_name filter removed — no local User table to join against.
            # Reintroduce once user_profiles cache table exists (join on that instead).

            props = query.all()
            return [
                PropertyType(
                    id=p.id,
                    title=p.title,
                    price=p.price,
                    city=p.city,
                    status=p.status,
                    agent_id=p.agent_user_id,
                    agent_name=p.agent_name,
                    description=p.description,
                    bedrooms=p.bedrooms,
                    bathrooms=p.bathrooms,
                    area=p.area,
                    address=p.address,
                )
                for p in props
            ]
        finally:
            db.close()

    @strawberry.field
    def my_properties(self, info: Info) -> List[PropertyType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            props = db.query(Property).filter(Property.agent_user_id == int(user_id)).all()
            return [
                PropertyType(
                    id=p.id,
                    title=p.title,
                    price=p.price,
                    city=p.city,
                    status=p.status,
                    agent_id=p.agent_user_id,
                    agent_name=p.agent_name,
                    description=p.description,
                    bedrooms=p.bedrooms,
                    bathrooms=p.bathrooms,
                    area=p.area,
                    address=p.address,
                )
                for p in props
            ]
        finally:
            db.close()
