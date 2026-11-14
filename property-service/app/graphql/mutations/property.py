import strawberry
from app.graphql.types.property import PropertyType, CreatePropertyInput, UpdatePropertyInput
from app.core.database import  SessionLocal
from app.models.property import Property
from app.models.idempotency import IdempotencyKey
from typing import Optional
from strawberry.types import Info
import asyncio
from app.core.kafka import publish_property_created
import uuid
from app.services.idempotency import ( OPERATION_CREATE_PROPERTY, hash_input, find_existing_idempotency)
from app.graphql.types.property_type import to_property_type
from sqlalchemy.exc import IntegrityError
import grpc


background_tasks: set = set()
@strawberry.type
class PropertyMutation:

    @strawberry.mutation
    def create_property(self, info : Info, input: CreatePropertyInput) -> PropertyType:
        user_id = info.context["user_id"]
        user_name = info.context["user_name"]
        user_email = info.context["user_email"]

        if not user_id:
            raise Exception("Not authenticated")

        user_id = int(user_id)
        grpc_client = info.context["user_grpc_client"]
        try:
             user = grpc_client.get_user(user_id)
        except grpc.RpcError as error:
             if error.code() == grpc.StatusCode.NOT_FOUND:
                  raise Exception("user account not found")
             elif error.code() in (
                  grpc.StatusCode.UNAVAILABLE,
                  grpc.StatusCode.DEADLINE_EXCEEDED
             ):
                  raise Exception("User service is termporarily unavailable") from error
             raise Exception("unable to verify user account") from error

        if not user.is_active:
             raise Exception("YOur account is inactive")
        if not user.profile_exists:
             raise Exception("your profile dont exist")
        if not user.is_agent:
             raise Exception("only agent can create property apply for agent")

        idempotency_key = info.context.get("idempotency_key")

        if not idempotency_key:
             raise Exception(
                  "Idempotency key header is required"
             )

        request_hash = hash_input(input)
        db = SessionLocal()
        try:

            existing_property = (
                 find_existing_idempotency(
                      db=db,
                      user_id=user_id,
                      key=idempotency_key,
                      request_hash=request_hash,
                 )
            )
            if existing_property:
                 return to_property_type(
                      existing_property
                 )
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
                agent_phone=input.agent_phone,
                image_url = input.image_url
            )

            db.add(new_property)
            db.flush()


            idempotency_record = IdempotencyKey(
                 user_id=user_id,
                 operation=OPERATION_CREATE_PROPERTY,
                 key = idempotency_key,
                 request_hash = request_hash,
                 resource_id= new_property.id,
            )
            db.add(idempotency_record)

            try:
                 db.commit()

            except IntegrityError:
                 db.rollback()

                 existing_property = (
                      find_existing_idempotency(
                           db=db,
                           user_id=user_id,
                           key=idempotency_key,
                           request_hash=request_hash,
                      )
                 )

                 if existing_property:
                      return to_property_type(
                           existing_property
                      )
                 raise
            db.refresh(new_property)


            event_id = str(
                 uuid.uuid5(
                      uuid.NAMESPACE_URL,
                      f"property-cerate: {new_property.id}",
                 )
            )

            task = asyncio.create_task(
                 publish_property_created({
                    "event_id" : event_id,
                    "id": new_property.id,
                    "title": new_property.title,
                    "price": new_property.price,
                    "city": new_property.city,
                    "property_type": new_property.property_type,
                    "agent_id": new_property.agent_user_id,
                    "agent_name": user_name,
                    "agent_email": user_email,
                    "agent_phone": new_property.agent_phone
                 })
            )
            background_tasks.add(task)
            task.add_done_callback(
                 background_tasks.discard
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
                image_url=new_property.image_url,
                agent_phone=new_property.agent_phone,
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
            if input.image_url is not None: prop.image_url = input.image_url
            if input.agent_phone is not None: prop.agent_phone = input.agent_phone

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
                agent_phone=prop.agent_phone,
                image_url=prop.image_url,
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



    

    
