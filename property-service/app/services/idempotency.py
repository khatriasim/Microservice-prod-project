import hashlib
import json

import strawberry

from app.models.property import Property
from app.models.idempotency import IdempotencyKey


OPERATION_CREATE_PROPERTY = "create_property"


def hash_input(input) -> str:
    """
    Create a stable SHA-256 hash of the GraphQL input.

    This lets us detect someone reusing the same
    idempotency key with different data.
    """

    payload = json.dumps(
        strawberry.asdict(input),
        sort_keys=True,
        default=str,
    )

    return hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest() # converts the hash into a readable hexadecimal string.


def find_existing_idempotency(
    db,
    user_id: int,
    key: str,
    request_hash: str,
):
    """
    Find a previously processed idempotency key.

    Returns:
        Property object if the request was already processed.

    Raises:
        Exception if the same key was reused with
        different request data.
    """

    record = (
        db.query(IdempotencyKey)
        .filter(
            IdempotencyKey.user_id == user_id,
            IdempotencyKey.operation == OPERATION_CREATE_PROPERTY,
            IdempotencyKey.key == key,
        )
        .first()
    )

    if record is None:
        return None

    # Same key but different request data
    if record.request_hash != request_hash:
        raise Exception(
            "Idempotency-Key was already used "
            "with a different request"
        )

    # Return the property associated with the original request
    return db.get(Property, record.resource_id)