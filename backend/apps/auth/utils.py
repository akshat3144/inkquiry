import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from constants import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from models.user import TokenData
from db.mongo import get_collection
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(email: str):
    user_collection = get_collection("users")
    user = user_collection.find_one({"email": email})
    return user

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"Authenticating token: {token[:15]}...")
        
        # Try to decode the token with different options in case of errors
        try:
            # First try standard verification
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except Exception as decode_error:
            print(f"First decode attempt failed: {str(decode_error)}")
            
            # If the standard verification fails, try without verifying expiration
            # This can help diagnose if the token is expired but otherwise valid
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
                print("Token is valid but may be expired")
            except Exception as second_error:
                print(f"Second decode attempt failed: {str(second_error)}")
                
                # If that also fails, check if the secret key is the default one
                if SECRET_KEY == "your-secret-key-placeholder":
                    print("WARNING: Using default secret key! This is not secure for production.")
                
                # Re-raise the original error
                raise decode_error
        
        # Extract email from payload
        email: str = payload.get("sub")
        if email is None:
            print("Token missing 'sub' claim (email)")
            raise credentials_exception
            
        # Check if token is expired
        if "exp" in payload:
            exp_timestamp = payload["exp"]
            current_timestamp = datetime.utcnow().timestamp()
            if current_timestamp > exp_timestamp:
                print(f"Token expired at {datetime.fromtimestamp(exp_timestamp)}")
                raise credentials_exception
                
        token_data = TokenData(email=email)
        print(f"Token decoded successfully for email: {email}")
    except jwt.PyJWTError as e:
        print(f"JWT decode error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected auth error: {str(e)}")
        raise credentials_exception
        
    # Get the user from the database
    try:
        user = get_user(email=token_data.email)
        if user is None:
            print(f"User not found for email: {token_data.email}")
            raise credentials_exception
            
        print(f"Authentication successful for user: {user['email']}")
        return user
    except Exception as db_error:
        print(f"Database error when getting user: {str(db_error)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user data"
        )