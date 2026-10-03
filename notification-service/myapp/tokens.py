from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token['sub'] = str(user.id)
        # RefreshToken.access_token copies these claims into every new access token.
        token['name'] = user.get_full_name() or user.username or user.email
        token['email'] = user.email
        profile = getattr(user, "userprofiles", None)
        token['is_agent'] = bool(profile and profile.is_agent)
        return token
