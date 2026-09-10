import re
from django.db.models import F

class PostViewMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        match = re.match(r'^/api/blog/post/(\d+)/$', request.path)
        if match:
            pk = match.group(1)
            from django.core.cache import cache
            from .models import Post
            user_id = request.user.id if request.user.is_authenticated else request.META.get('REMOTE_ADDR')
            cache_key = f"viewed:{user_id}:{pk}"
            if not cache.get(cache_key):
                Post.objects.filter(id=pk).update(views=F('views') + 1)
                cache.set(cache_key, True, 3600)
        response = self.get_response(request)
        return response