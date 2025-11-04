from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone

from models.user import UserCreate, UserLogin, User, UserResponse, TokenResponse
from utils.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from database import db

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user
    """
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if username is taken
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user object with hashed password
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        is_seller=user_data.is_seller  # Allow setting seller status during registration
    )
    
    # Convert to dict and serialize datetime
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    # Insert into database
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    # Prepare user response
    user_response = UserResponse(**user.model_dump())
    
    return TokenResponse(
        access_token=access_token,
        user=user_response
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login user with email and password
    """
    # Find user by email
    user_dict = await db.users.find_one({"email": credentials.email})
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Parse datetime from ISO string
    if isinstance(user_dict['created_at'], str):
        user_dict['created_at'] = datetime.fromisoformat(user_dict['created_at'])
    
    # Create User object
    user = User(**user_dict)
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    # Prepare user response
    user_response = UserResponse(**user.model_dump())
    
    return TokenResponse(
        access_token=access_token,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user profile
    """
    user_dict = await db.users.find_one({"id": current_user["id"]})
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Parse datetime from ISO string
    if isinstance(user_dict['created_at'], str):
        user_dict['created_at'] = datetime.fromisoformat(user_dict['created_at'])
    
    user = User(**user_dict)
    return UserResponse(**user.model_dump())
