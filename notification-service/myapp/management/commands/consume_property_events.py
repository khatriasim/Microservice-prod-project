import json
from kafka import KafkaConsumer
from django.core.management.base import BaseCommand
from django.conf import settings
from myapp.tasks import send_property_notification


class Command(BaseCommand):
    help = "Listens to Kafka property_created topic and triggers notifications"

    def handle(self, *args, **options):
        consumer = KafkaConsumer(
            settings.KAFKA_TOPIC_PROPERTY_CREATED,
            bootstrap_servers=settings.KAFKA_BROKER,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            auto_offset_reset='latest',
            group_id='notification-service-group',
        )

        self.stdout.write(
            self.style.SUCCESS("Listening for property_created events...")
        )

        for message in consumer:
            property_data = message.value
            self.stdout.write(f"Received: {property_data}")
            send_property_notification.delay(property_data)