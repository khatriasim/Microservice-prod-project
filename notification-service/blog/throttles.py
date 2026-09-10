from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class ListPostsAnnonThrottle(AnonRateThrottle):
    rate = '50/hour'

class CreatePostUserThrottle(UserRateThrottle):
    rate = '10/hout'