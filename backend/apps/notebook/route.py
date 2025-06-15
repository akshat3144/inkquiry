from fastapi import APIRouter, Depends, HTTPException, status
from models.user import NotebookPage
from db.mongo import get_collection
from apps.auth.utils import get_current_user
from typing import List
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/pages", response_model=List[NotebookPage])
async def get_pages(current_user = Depends(get_current_user)):
    # Return all notebook pages for the current user
    return current_user.get("notebook_pages", [])

@router.post("/pages", response_model=NotebookPage)
async def create_page(page: NotebookPage, current_user = Depends(get_current_user)):
    user_collection = get_collection("users")
    
    # Format the page with the current timestamp if not provided
    if not page.date_created:
        page.date_created = datetime.now()
    
    page_dict = page.model_dump()
    
    # Add page to user's notebook_pages array
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$push": {"notebook_pages": page_dict}}
    )
    
    return page_dict

@router.put("/pages/{page_id}", response_model=NotebookPage)
async def update_page(page_id: str, updated_page: NotebookPage, current_user = Depends(get_current_user)):
    user_collection = get_collection("users")
    
    # Find the page in the user's notebook
    page_index = next(
        (i for i, page in enumerate(current_user.get("notebook_pages", [])) 
         if page.get("id") == page_id), 
        -1
    )
    
    if page_index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Update the page
    page_dict = updated_page.model_dump()
    
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {f"notebook_pages.{page_index}": page_dict}}
    )
    
    return page_dict

@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(page_id: str, current_user = Depends(get_current_user)):
    user_collection = get_collection("users")
    
    # Remove the page from the user's notebook_pages array
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$pull": {"notebook_pages": {"id": page_id}}}
    )
    
    return None