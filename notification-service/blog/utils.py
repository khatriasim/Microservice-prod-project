from django_redis import get_redis_connection
from .models import Follow

def get_following_usernames(user):
    if not user or not user.is_authenticated:
        return set()
    return set(
        Follow.objects.filter(follower=user)
        .values_list("following__username", flat=True)
    )

def invalidate_post_cache():
    redis = get_redis_connection("default")
    keys = redis.keys("*posts*")
    if keys:
        redis.delete(*keys)
