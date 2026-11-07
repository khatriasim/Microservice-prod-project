from fastapi import Depends, Request
from redis.asyncio import Redis

from app.core.redis import get_redis
from app.core.rate_limiter import token_bucket

async def rate_limit(
        request: Request,
        redis_client: Redis = Depends(get_redis)
):
    if request.client:
        identfier = request.client.host
    else: 
        identfier = "unknown"

    await token_bucket.allow_request(
        redis_client=redis_client,
        identifier=identfier
    )