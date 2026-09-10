import json
from aiokafka import AIOKafkaProducer
from app.core.config import settings

producer = None

async def get_kafka_producer():
    global producer
    if producer is None:
        producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_broker
        )
        await producer.start()
    return producer


async def publish_property_created(property_data: dict):
    producer = await get_kafka_producer()
    await producer.send(
        topic="property_created",        # ← topic name
        value=json.dumps(property_data).encode("utf-8")
    )
    print(f"Published to Kafka: {property_data}")