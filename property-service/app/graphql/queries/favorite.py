import strawberry
from strawberry.types import Info
from typing import List
from app.core.database import SessionLocal
from app.models.favorite import Favorite
from app.graphql.types.favorite import FavoriteType

@strawberry.type
class FavoriteQuery:

    @strawberry.field
    def my_favorites(self, info: Info) -> List[FavoriteType]:
        user_id = info.context["user_id"]
        if not user_id:
            raise Exception("Not authenticated")

        db = SessionLocal()
        try:
            favorites = db.query(Favorite).filter(Favorite.user_id == int(user_id)).all()
            return [
                FavoriteType(
                    id=f.id,
                    property_id=f.property_id,
                    user_id=f.user_id,
                    property_title=f.property.title if f.property else None,
                )
                for f in favorites
            ]
        finally:
            db.close()