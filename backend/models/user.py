from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Union
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class NotebookPage(BaseModel):
    id: str
    name: str
    date_created: Union[datetime, str]  # Allow datetime or string format
    content: Optional[List[Dict[str, str]]] = []
    canvas_data: Optional[str] = None
    canvasData: Optional[str] = None  # Add explicit camelCase field
    
    class Config:
        # Allow field name aliases for frontend compatibility
        populate_by_name = True
        arbitrary_types_allowed = True
        # Add field aliases for camelCase frontend field names
        fields = {
            "date_created": {"alias": "dateCreated"},
            "canvas_data": {"alias": "canvasData"}
        }
    
    # Add json serialization handling for the datetime field
    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        # Convert datetime to ISO string for JSON serialization
        if isinstance(data.get("date_created"), datetime):
            data["date_created"] = data["date_created"].isoformat()
        return data
        
    # Add validation to handle string dates
    @validator('date_created', pre=True)
    def parse_date(cls, value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                try:
                    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%f")
                except (ValueError, TypeError):
                    pass
        return datetime.now()  # Default to current time if parsing fails
        return data


class UserDB(UserBase):
    id: str = Field(...)
    hashed_password: str
    created_at: datetime
    notebook_pages: Optional[List[NotebookPage]] = []
    
    
class UserResponse(UserBase):
    id: str
    created_at: datetime