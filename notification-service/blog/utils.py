# utils.py
from django_redis import get_redis_connection

def invalidate_post_cache():
    redis = get_redis_connection("default")
    keys = redis.keys("*posts*")
    if keys:
        redis.delete(*keys)