import strawberry
from strawberry.types import Info
from typing import List, Optional
from app.graphql.types.property import PropertyType
from app.core.database import SessionLocal
from app.models.property import Property
from app.models.search_log import SearchLog
from app.core.recommendation import build_user_profile, score_property
@strawberry.type
class PropertyQuery:

    @strawberry.field
    def properties(self, info:Info,
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
            user_id = info.context.get("user_id")
            if user_id and (city or min_price or max_price or bedrooms or property_type):
                log = SearchLog(
                    user_id=int(user_id),
                    city = city,
                    min_price=min_price,
                    max_price=max_price,
                    bedrooms=bedrooms,
                    property_type=property_type,
                )
                db.add(log)
                db.commit()

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


    @strawberry.field
    def recommended_properties(self, info: Info, limit: int = 10) -> List[PropertyType]:
        user_id = info.context.get("user_id")
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            profile = build_user_profile(db, int(user_id))
            print(f"USER PROFILE: {profile}")

            candidates = db.query(Property).filter(Property.status == "available", ~Property.id.in_(profile["favorited_property_ids"]) if profile["favorited_property_ids"] else True
            ).all()

            scored = [(p, score_property(p, profile)) for p in candidates]
            for p, s in scored:
                print(f"Property {p.id} | {p.title} | {p.city} | price={p.price} | bd={p.bedrooms} | SCORE={s}")
            scored.sort(key=lambda x: x[1], reverse=True)
            top = scored[:limit]

            return [
                PropertyType(
                    id=p.id,
                    title=p.title,
                    price=p.price,
                    city=p.city,
                    status=p.status,
                    agent_id=p.agent_user_id,
                    agent_name=p.agent_name,
                    agent_email=p.agent_email,
                    description=p.description,
                    bedrooms=p.bedrooms,
                    bathrooms=p.bathrooms,
                    area=p.area,
                    address=p.address,
                )
                for p, score in top
            ]
        finally:
            db.close()


@strawberry.field
def view_property(self, info: Info, id: int) -> Optional[PropertyType]:
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == id).first()
        if not prop:
            return None

        return PropertyType(
            id=prop.id,
            title=prop.title,
            price=prop.price,
            city=prop.city,
            status=prop.status,
            agent_id=prop.agent_user_id,
            agent_name=prop.agent_name,
            agent_email=prop.agent_email,
            description=prop.description,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            area=prop.area,
            address=prop.address,
            property_type=prop.property_type,
        )
    finally:
        db.close()