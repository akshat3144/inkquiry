from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from models.user import UserCreate, UserResponse, Token, UserDB
from apps.auth.utils import authenticate_user, create_access_token, get_password_hash, get_current_user
from db.mongo import get_collection
from constants import ACCESS_TOKEN_EXPIRE_MINUTES
from bson import ObjectId

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    user_collection = get_collection("users")
    # Check if user already exists
    if user_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.model_dump()
    hashed_password = get_password_hash(user_dict.pop("password"))
    
    new_user = {
        "email": user_dict["email"],
        "full_name": user_dict.get("full_name"),
        "hashed_password": hashed_password,
        "created_at": datetime.now(),
        "notebook_pages": []
    }
    
    result = user_collection.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    
    return {
        "id": new_user["id"],
        "email": new_user["email"],
        "full_name": new_user["full_name"],
        "created_at": new_user["created_at"]
    }

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    try:
        print(f"Current user request - Email: {current_user.get('email', 'unknown')}")
        print(f"User data: ID={current_user.get('_id', 'Unknown')}, Name={current_user.get('full_name', 'Not provided')}")
        
        # Check if _id exists and is valid
        if '_id' not in current_user:
            print("ERROR: User document missing _id field")
            current_user_id = "unknown"
        else:
            current_user_id = str(current_user["_id"])
            
        # Create response with safe fallbacks for missing fields
        return {
            "id": current_user_id,
            "email": current_user.get("email", "unknown@example.com"),
            "full_name": current_user.get("full_name"),
            "created_at": current_user.get("created_at", datetime.now())
        }
    except Exception as e:
        print(f"Error processing user data in /me endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing user data: {str(e)}"
        )