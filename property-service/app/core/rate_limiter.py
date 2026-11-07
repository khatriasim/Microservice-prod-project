import math
from fastapi import HTTPException
from redis.asyncio import Redis

TOKEN_BUCKET_LUA = """
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

-- Get current Redis server time.
-- This avoids relying on the time of different FastAPI servers.
local redis_time = redis.call('TIME')

local now =
    tonumber(redis_time[1])
    + tonumber(redis_time[2]) / 1000000


-- Get current bucket values.
local tokens = tonumber(
    redis.call('HGET', key, 'tokens')
)

local last_time = tonumber(
    redis.call('HGET', key, 'last_time')
)


-- Bucket does not exist yet.
-- Start with a full bucket.
if tokens == nil or last_time == nil then
    tokens = capacity
    last_time = now
end


-- Calculate how much time has passed.
local elapsed = math.max(
    0,
    now - last_time
)


-- Add newly generated tokens.
tokens = math.min(
    capacity,
    tokens + (elapsed * refill_rate)
)


local allowed = 0
local retry_after = 0


-- We need one token for one request.
if tokens >= 1 then

    tokens = tokens - 1

    allowed = 1

else

    -- Calculate how long until
    -- one token becomes available.
    retry_after = math.ceil(
        (1 - tokens) / refill_rate
    )

end


-- Save the new bucket state.
redis.call(
    'HSET',
    key,
    'tokens',
    tokens,
    'last_time',
    now
)


-- Automatically remove inactive buckets.
redis.call(
    'EXPIRE',
    key,
    ttl
)


return {
    allowed,
    math.floor(tokens),
    retry_after
}
"""

class TokenBucketRateLimiter:

    def __init__(self, capacity: int = 80, refill_seconds: int= 600,):
        self.capacity = capacity
        self.refill_rate = (
            capacity / refill_seconds
        )
        self.ttl = refill_seconds * 2

    async def allow_request(
            self, redis_client : Redis, identifier: str,
    ) -> None:

        key = (
             f"rate_limit:"
            f"token_bucket:"
            f"{identifier}"
        )

        result = await redis_client.eval(
            TOKEN_BUCKET_LUA,
            1,
            key,
            self.capacity,
            self.refill_rate,
            self.ttl
        )

        allowed = int(result[0])
        remainig_tokens = int(result[1])
        retry_after = int(result[2])

        if not allowed:

            raise HTTPException(
                status_code = 129,
                detail=(
                     "Rate limit exceeded. "
                    "Please try again later."
                ),
                headers={
                    "Retry-After" : str(
                        retry_after
                    )
                }
            )

token_bucket = TokenBucketRateLimiter(
    capacity=80,
    refill_seconds=800,
)