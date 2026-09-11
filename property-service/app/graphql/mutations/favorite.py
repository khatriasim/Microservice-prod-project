import strawberry
from strawberry.types import Info
from app.core.database import SessionLocal
from app.models.favorite import Favorite
from app.models.property import Property
from app.graphql.types.favorite import FavoriteType

@strawberry.type
class FavouriteMutation:

    @strawberry.mutation
    def toggle_favourites(self, info:Info, property_id:int) -> bool:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("not authinticated")

        db = SessionLocal()
        try:
            existing = db.query(Favorite).filter(Favorite.user_id == int(user_id), Favorite.property_id == property_id).first()

            if existing:
                db.delete(existing)
                db.commit()
                return False

            prop = db.query(Property).filter(Property.id == property_id).first()
            if not prop:
                raise Exception("Property not found")

            new_favorite = Favorite(user_id=int(user_id), property_id=property_id)
            db.add(new_favorite)
            db.commit()
            return True
        finally:
            db.close()