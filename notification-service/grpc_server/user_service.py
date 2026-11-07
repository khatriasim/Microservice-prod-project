
import grpc

from django.contrib.auth.models import User
from myapp.models import UserProfiles

from generated.user.v1 import user_pb2
from generated.user.v1 import user_pb2_grpc


class UserService(user_pb2_grpc.UserServiceServicer):

    def GetUser(self, request, context):
        user_id = request.user_id

        try:
            user = User.objects.get(id=user_id)

        except User.DoesNotExist:
            context.abort(
                grpc.StatusCode.NOT_FOUND,
                "User not found"
            )

        try:
            profile = UserProfiles.objects.get(user=user)

            profile_exists = True
            is_email_verified = profile.is_email_verified
            is_agent = profile.is_agent

        except UserProfiles.DoesNotExist:
            profile_exists = False
            is_email_verified = False
            is_agent = False

        return user_pb2.GetUserResponse(
            user_id=user.id,
            is_active=user.is_active,
            profile_exists=profile_exists,
            is_email_verified=is_email_verified,
            is_agent=is_agent
        )
