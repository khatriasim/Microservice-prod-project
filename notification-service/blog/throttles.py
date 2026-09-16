from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class ListPostsAnnonThrottle(AnonRateThrottle):
    rate = '50000/hour'

class CreatePostUserThrottle(UserRateThrottle):
    rate = '300000/hour'