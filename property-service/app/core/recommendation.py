from collections import Counter
from sqlalchemy.orm import Session
from app.models.favorite import Favorite
from app.models.search_log import SearchLog
from app.models.property import Property

def build_user_profile(db: Session, user_id: int) -> dict:

    searches = db.query(SearchLog).filter(SearchLog.user_id == user_id).all()
    favorite_rows = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    favorited_properties = [f.property for f in favorite_rows if f.property]

    cities = Counter()
    property_types = Counter()
    bedrooms_list = []
    prices = []

    for s in searches:
        if s.city:
            cities[s.city.strip().lower()] += 1
        if s.property_type:
            property_types[s.property_type] += 1
        if s.bedrooms:
            bedrooms_list.append(s.bedrooms)
        if s.min_price and s.max_price:
            prices.append((s.min_price + s.max_price) / 2)
        elif s.max_price:
            prices.append(s.max_price)

    for p in favorited_properties:
        cities[p.city.strip().lower()] += 3
        property_types[p.property_type] += 3
        bedrooms_list.extend([p.bedrooms] * 3 if p.bedrooms else [])
        prices.extend([p.price] * 3)

    profile = {
        "preferred_city": cities.most_common(1)[0][0] if cities else None,
        "preferred_property_type": property_types.most_common(1)[0][0] if property_types else None,
        "preferred_bedrooms": round(sum(bedrooms_list) / len(bedrooms_list)) if bedrooms_list else None,
        "preferred_avg_price": sum(prices) / len(prices) if prices else None,
        "favorited_property_ids": {p.id for p in favorited_properties},
    }
    return profile


def score_property(prop: Property, profile: dict) -> float:
    score = 0.0

    if profile["preferred_city"] and prop.city.strip().lower() == profile["preferred_city"]:
        score += 40

    if profile["preferred_avg_price"] and prop.price:
        diff_ratio = abs(prop.price - profile["preferred_avg_price"]) / profile["preferred_avg_price"]
        price_score = max(0, 1 - diff_ratio) * 30
        score += price_score

    if profile["preferred_property_type"] and prop.property_type == profile["preferred_property_type"]:
        score += 15

    if profile["preferred_bedrooms"] and prop.bedrooms:
        bed_diff_ratio = abs(prop.bedrooms - profile["preferred_bedrooms"]) / max(profile["preferred_bedrooms"], 1)
        bed_score = max(0, 1 - bed_diff_ratio) * 15
        score += bed_score

    return round(score, 2)