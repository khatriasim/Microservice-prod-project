
import logging
from concurrent import futures

import grpc
from django.conf import settings
from django.core.management.base import BaseCommand

from grpc_server.user_service import UserService
from generated.user.v1 import user_pb2_grpc


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Starts the EstateHub User gRPC server"

    def handle(self, *args, **options):
        server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10)
        )

        user_pb2_grpc.add_UserServiceServicer_to_server(
            UserService(),
            server
        )

        grpc_port = getattr(settings, "GRPC_PORT", "50051")

        server.add_insecure_port(f"[::]:{grpc_port}")
        server.start()

        self.stdout.write(
            self.style.SUCCESS(
                f"User gRPC server running on port {grpc_port}"
            )
        )

        try:
            server.wait_for_termination()
        except KeyboardInterrupt:
            logger.info("Shutting down gRPC server")
            server.stop(grace=5).wait()
