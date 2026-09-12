import strawberry
from app.graphql.types.property import PropertyType, CreatePropertyInput, UpdatePropertyInput
from app.core.database import  SessionLocal
from app.models.property import Property
from typing import Optional
from strawberry.types import Info
import asyncio
from app.core.kafka import publish_property_created

@strawberry.type
class PropertyMutation:

    @strawberry.mutation
    def create_property(self, info : Info, input: CreatePropertyInput) -> PropertyType:
        user_id = info.context["user_id"]
        user_name = info.context["user_name"]
        user_email = info.context["user_email"]

        if not user_id:
            raise Exception("Not authenticated")
        db = SessionLocal()
        try:
            new_property = Property(
                title=input.title,
                price=input.price,
                city=input.city,
                property_type=input.property_type,
                description=input.description,
                bedrooms=input.bedrooms,
                bathrooms=input.bathrooms,
                area=input.area,
                address=input.address,
                agent_user_id=int(user_id),
                status="available",
                agent_name=user_name,
                agent_email=user_email,
            )

            db.add(new_property)
            db.commit()
            db.refresh(new_property)

            asyncio.create_task(
                 publish_property_created({
                    "id": new_property.id,
                    "title": new_property.title,
                    "price": new_property.price,
                    "city": new_property.city,
                    "property_type": new_property.property_type,
                    "agent_id": new_property.agent_user_id,
                    "agent_name": user_name,
                    "agent_email": user_email
                 })
            )

            return PropertyType(
                id=new_property.id,
                title=new_property.title,
                price=new_property.price,
                city=new_property.city,
                status=new_property.status,
                agent_id=new_property.agent_user_id,
                agent_name=new_property.agent_name,
                description=new_property.description,
                bedrooms=new_property.bedrooms,
                bathrooms=new_property.bathrooms,
                area=new_property.area,
                address=new_property.address,
                property_type = new_property.property_type,
            )
        finally:
            db.close()

    @strawberry.mutation
    def update_property(self, info : Info, id: int,  input: UpdatePropertyInput) -> Optional[PropertyType]:
        user_id = info.context["user_id"]
        if not user_id:
                    raise Exception("Not availabel")
        db = SessionLocal()
        try:  
            prop = db.query(Property).filter(Property.id == id).first()
            if not prop:
                return None

            if prop.agent_user_id != int(user_id):
                 raise Exception("not  your property")

            if input.title is not None: prop.title = input.title
            if input.price is not None: prop.price = input.price
            if input.city is not None: prop.city = input.city
            if input.status is not None: prop.status = input.status
            if input.description is not None: prop.description = input.description
            if input.bedrooms is not None: prop.bedrooms = input.bedrooms
            if input.bathrooms is not None: prop.bathrooms = input.bathrooms
            if input.area is not None: prop.area = input.area
            if input.address is not None: prop.address = input.address
            if input.property_type is not None: prop.property_type = input.property_type

            db.commit()
            db.refresh(prop)

            return PropertyType(
                id=prop.id,
                title=prop.title,
                price=prop.price,
                city=prop.city,
                status=prop.status,
                agent_id=prop.agent_user_id,
                description=prop.description,
                bedrooms=prop.bedrooms,
                bathrooms=prop.bathrooms,
                area=prop.area,
                address=prop.address,
                agent_name=prop.agent_name,
        )
        finally:
            db.close()

    @strawberry.mutation
    def delete_property(self, info : Info, id: int, ) -> bool:
        user_id = info.context["user_id"]
        if not user_id:
             raise Exception("NOT authorized ")
        db = info.context["db"]
        try:
            prop = db.query(Property).filter(Property.id == id).first()
            if not prop:
                return False

            if prop.agent_user_id != int(user_id):
                 raise Exception("Not your properyt")
            db.delete(prop)
            db.commit()
            return True
        finally:
            db.close()



    

    
