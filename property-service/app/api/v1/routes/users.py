from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decoded_token
import json
from app.core.redis import get_redis
from redis.asyncio import Redis

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model = UserResponse)
async def register(user : UserCreate, db: Session = Depends(get_db), redis : Redis = Depends(get_redis)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing: 
        raise HTTPException(status_code=400, detail="Email alresady exists")
    

    db_user = User(
        name=user.name,
        email = user.email,
        age=user.age,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    await redis.delete("users:all")
    return db_user


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code = 401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub":str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value= access_token,
        httponly= True,
        max_age=60 * 15, 
        secure=False,    
        samesite="lax"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * 90,  
        secure=False,
        samesite="lax"
    )

    return {
        "message": "Login successful"
    }


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token missing"
    )
    try:
        payload = decoded_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value= new_access_token,
        httponly= True,
        max_age=60 * 15, 
        secure=False,    
        samesite="lax"
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * 90,  
        secure=False,
        samesite="lax"
    )

    return {
        "message": "token refreshed successfully"
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/all", response_model=list[UserResponse])
async def get_all_user(
    admin: User = Depends(require_admin),
    db : Session = Depends(get_db),
    redis : Redis = Depends(get_redis)
):
    cached = await redis.get("users:all")
    if cached:
        print("cache git form reis")
        return json.loads(cached)
    
    print("cache miss")
    users = db.query(User).all()
    result = [
        {"id": u.id, "name": u.name, "email": u.email, "is_admin": u.is_admin}
        for u in users
    ]

    await redis.set("users:all", json.dumps(result), ex = 60)
    return result