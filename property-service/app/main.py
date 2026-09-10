from fastapi import FastAPI, Request
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.database import Base, engine
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import socket
from contextlib import asynccontextmanager
import redis.asyncio as aioredis
from app.graphql.schema import schema, graphql_router
from strawberry.fastapi import GraphQLRouter
from app.core.kafka import get_kafka_producer, producer


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine) 

    await get_kafka_producer()
    print("kafaka producer started")
    try:
        client = aioredis.Redis.from_url(settings.redis_url,    decode_responses = True)    
        await client.ping()
        print ("redis connected success")
        await client.close()
    except Exception:
        print("redis not available - skipping") 
    yield

    if producer:
        await producer.stop()
        print("kafak producer stopped")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "testserver", "fastapi.local", "*.railway.app","fastapi-production-5801.up.railway.app", ]
)

app.include_router(api_router)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_router, prefix="/graphql")
@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/whoami")
def whoami(request: Request):
    return {
        "container": socket.gethostname(),
        "client_ip": request.headers.get("X-Real-IP"),
        "forwarded_for": request.headers.get("X-Forwarded-For"),
        "host": request.headers.get("Host"),
        "proto": request.headers.get("X-Forwarded-Proto"),
        }
