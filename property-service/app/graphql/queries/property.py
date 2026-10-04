import strawberry
import math
from strawberry.types import Info
from typing import List, Optional
from app.graphql.types.property import PropertyType
from app.core.database import SessionLocal
from app.models.property import Property
from app.models.user import User
from app.models.search_log import SearchLog
from app.core.recommendation import build_user_profile, score_property

@strawberry.type
class PropertyQuery:

    @strawberry.field
    def properties(self, info: Info,
                   city: Optional[str] = None,
                   min_price: Optional[float] = None,
                   max_price: Optional[float] = None,
                   bedrooms: Optional[int] = None,
                   property_type: Optional[str] = None,
                   bathrooms: Optional[int] = None,
                   limit: int = 30,
                   ) -> List[PropertyType]:
        db = SessionLocal()
        try:
            has_criteria = any([
                city, min_price, max_price, bedrooms, bathrooms, property_type
            ])

            user_id = info.context.get("user_id")
            if user_id and has_criteria:
                log = SearchLog(
                    user_id=int(user_id),
                    city=city,
                    min_price=min_price,
                    max_price=max_price,
                    bedrooms=bedrooms,
                    property_type=property_type,
                )
                db.add(log)
                db.commit()

            base_query = db.query(Property).filter(Property.status == "available")

            # --- No search criteria at all: just return everything ---
            if not has_criteria:
                props = base_query.order_by(Property.id.desc()).limit(limit).all()
                return _to_property_types(props)

            # --- Step 1: try an EXACT match on everything the user specified ---
            exact_query = base_query
            if city:
                exact_query = exact_query.filter(Property.city.ilike(city.strip()))
            if bedrooms is not None:
                exact_query = exact_query.filter(Property.bedrooms == bedrooms)
            if bathrooms is not None:
                exact_query = exact_query.filter(Property.bathrooms == bathrooms)
            if property_type:
                exact_query = exact_query.filter(Property.property_type.ilike(property_type.strip()))
            if min_price is not None:
                exact_query = exact_query.filter(Property.price >= min_price)
            if max_price is not None:
                exact_query = exact_query.filter(Property.price <= max_price)

            exact_matches = exact_query.limit(limit).all()
            if exact_matches:
                return _to_property_types(exact_matches)

            # --- Step 2: no exact match — fall back to CITY as top priority ---
            # City is the ONLY hard filter here. Bedrooms/bathrooms/type are
            # intentionally dropped so a city never returns empty just because
            # no listing matches every secondary filter exactly.
            if city:
                city_matches = base_query.filter(Property.city.ilike(city.strip())).all()
            else:
                city_matches = base_query.all()

            if not city_matches:
                # The city itself has zero listings — nothing sensible to show.
                return []

            # --- Step 3: if no price range given, just return the city matches ---
            if min_price is None and max_price is None:
                return _to_property_types(city_matches[:limit])

            # --- Step 4: split into below-range and above-range, take closest 3 of each ---
            below = [
                p for p in city_matches
                if p.price is not None and min_price is not None and p.price < min_price
            ]
            above = [
                p for p in city_matches
                if p.price is not None and max_price is not None and p.price > max_price
            ]
            in_range = [
                p for p in city_matches
                if p.price is not None
                and (min_price is None or p.price >= min_price)
                and (max_price is None or p.price <= max_price)
            ]

            # closest below min_price: sort descending by price (biggest = closest to min)
            below_sorted = sorted(below, key=lambda p: p.price, reverse=True)[:3]
            # closest above max_price: sort ascending by price (smallest = closest to max)
            above_sorted = sorted(above, key=lambda p: p.price)[:3]

            result = in_range + below_sorted + above_sorted
            return _to_property_types(result[:limit])

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

            if not profile["has_signal"]:
                return []

            filters = [Property.status == "available"]
            if profile["favorited_property_ids"]:
                filters.append(~Property.id.in_(profile["favorited_property_ids"]))

            candidates = db.query(Property).filter(*filters).all()

            scored = [(p, score_property(p, profile)) for p in candidates]
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
                    property_type=p.property_type,
                    image_url=p.image_url,
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
                image_url=prop.image_url,
                agent_phone=prop.agent_phone,
            )
        finally:
            db.close()      



    # @strawberry.field
    # def all_agents(self, info: Info) -> List[Agents]:
    #     db = SessionLocal()
    #     try:
    #         users = db.query(User).all()
    #         return [
    #             Agents(
    #                 name=user.name,
    #                 email=user.email,
    #             )
    #             for user in users
    #         ]
    #     finally:
    #         db.close()


def _to_property_types(props):
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
                property_type=p.property_type,
                image_url=p.image_url,
            )
            for p in props
        ]