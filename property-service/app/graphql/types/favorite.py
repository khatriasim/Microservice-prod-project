import strawberry
from typing import Optional

@strawberry.type
class FavoriteType:
    id: int
    property_id: int
    user_id: int
    property_title: Optional[str] = None