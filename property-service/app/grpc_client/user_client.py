import grpc

from user.v1 import user_pb2, user_pb2_grpc


class UserGrpcClient:

    def __init__(self, target: str):

        # Create communication channel
        self.channel = grpc.insecure_channel(target)

        # Create client stub using that channel
        self.stub = user_pb2_grpc.UserServiceStub(
            self.channel
        )

    def get_user(self, user_id: int):

        # Prepare request
        request = user_pb2.GetUserRequest(
            user_id=user_id
        )

        # Call Django's GetUser method
        response = self.stub.GetUser(
            request,
            timeout=3
        )

        return response

    def close(self):
        self.channel.close()