from fastapi import APIRouter
from app.api.v1.routes import users

# This file collects ALL v1 routes in one place
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(users.router)
# Later you'll add more like:
# api_router.include_router(products.router)
# api_router.include_router(orders.router)