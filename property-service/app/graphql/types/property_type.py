from app.graphql.types.property import PropertyType
from app.models.property import Property


def to_property_type(property: Property) -> PropertyType:
    return PropertyType(
        id=property.id,
        title=property.title,
        price=property.price,
        city=property.city,
        status=property.status,
        agent_id=property.agent_user_id,
        agent_name=property.agent_name,
        description=property.description,
        bedrooms=property.bedrooms,
        bathrooms=property.bathrooms,
        area=property.area,
        address=property.address,
        property_type=property.property_type,
        image_url=property.image_url,
        agent_phone=property.agent_phone,
    )