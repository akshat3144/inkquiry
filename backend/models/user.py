from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
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
    date_created: datetime
    content: Optional[List[Dict[str, str]]] = []
    canvas_data: Optional[str] = None


class UserDB(UserBase):
    id: str = Field(...)
    hashed_password: str
    created_at: datetime
    notebook_pages: Optional[List[NotebookPage]] = []
    
    
class UserResponse(UserBase):
    id: str
    created_at: datetime