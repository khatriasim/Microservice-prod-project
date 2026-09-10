import redis.asyncio as redis
from app.core.config import settings

pool = redis.ConnectionPool.from_url(
    settings.redis_url,
    decode_responses = True
)
async def get_redis():
    client = redis.Redis(connection_pool=pool)
    try:
        yield client
    finally:
        await client.aclose()