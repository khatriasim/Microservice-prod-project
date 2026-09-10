import pytest
import os

# override BEFORE app imports
os.environ["DATABASE_URL"] = "postgresql://fastapi_user:password123@localhost:5433/fastapi_db"
os.environ["REDIS_URL"] = "redis://localhost:6380"

from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c