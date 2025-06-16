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
    try:
        # Print debug info about the user
        print(f"Getting pages for user: {current_user.get('email')}")
        print(f"User ID: {current_user.get('_id')}")
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # Return all notebook pages for the current user
        pages = current_user.get("notebook_pages", [])
        print(f"Found {len(pages)} pages for user")
        
        # Print some info about each page
        for i, page in enumerate(pages):
            print(f"Page {i+1}: id={page.get('id')}, name={page.get('name')}")
            has_canvas = bool(page.get('canvas_data') or page.get('canvasData'))
            print(f"   Has canvas data: {has_canvas}")
        
        # Ensure date_created is properly formatted for each page
        for page in pages:
            if isinstance(page.get("date_created"), datetime):
                page["date_created"] = page["date_created"].isoformat()
                print(f"   Converted datetime to ISO: {page['date_created']}")
            elif isinstance(page.get("dateCreated"), datetime):
                page["date_created"] = page["dateCreated"].isoformat()
                print(f"   Converted camelCase datetime to ISO: {page['date_created']}")
            elif not page.get("date_created"):
                # If no date is present, add current date
                current_date = datetime.now().isoformat()
                page["date_created"] = current_date
                print(f"   Added missing date: {current_date}")
                
        # Make sure all required fields are present
        valid_pages = []
        for page in pages:
            if not page.get("id"):
                print(f"   Skipping page with missing id: {page.get('name', 'unnamed')}")
                continue
                
            if not page.get("name"):
                page["name"] = f"Page {page.get('id')[:8]}"
                print(f"   Added missing name: {page['name']}")
                
            valid_pages.append(page)
            
        print(f"Returning {len(valid_pages)} valid pages")
        return valid_pages
    except Exception as e:
        print(f"Error in get_pages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving notebook pages: {str(e)}"
        )

@router.post("/pages", response_model=NotebookPage)
async def create_page(page: NotebookPage, current_user = Depends(get_current_user)):
    try:
        user_collection = get_collection("users")
        
        # Print debug info
        print(f"Creating page for user: {current_user.get('email')}")
        print(f"Page ID: {page.id}, Name: {page.name}")
        has_canvas = bool(getattr(page, 'canvas_data', None) or getattr(page, 'canvasData', None))
        print(f"Has canvas data: {has_canvas}")
        
        # Format the page with the current timestamp if not provided
        if not page.date_created:
            page.date_created = datetime.now()
            print("Setting current datetime")
            
        # Convert to dict and verify content
        page_dict = page.model_dump()
        print(f"Page dict keys: {list(page_dict.keys())}")
        
        # Ensure canvas_data is properly set - handle both naming conventions
        if not page_dict.get("canvas_data") and page_dict.get("canvasData"):
            page_dict["canvas_data"] = page_dict["canvasData"]
            print("Copied canvasData to canvas_data field")
            
        canvas_data_size = len(page_dict.get('canvas_data', '')) if page_dict.get('canvas_data') else 0
        print(f"Canvas data size: {canvas_data_size} bytes")
        
        # Handle date field if it's a string
        if isinstance(page_dict.get("date_created"), str):
            try:
                # Try to parse as ISO format
                page_dict["date_created"] = datetime.fromisoformat(
                    page_dict["date_created"].replace("Z", "+00:00")
                )
                print(f"Converted date from string: {page_dict['date_created']}")
            except (ValueError, TypeError):
                # Default to current date if parsing fails
                page_dict["date_created"] = datetime.now()
                print("Using current datetime for date_created")
        
        # Add page to user's notebook_pages array
        result = user_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$push": {"notebook_pages": page_dict}}
        )
        print(f"MongoDB update result: matched={result.matched_count}, modified={result.modified_count}")
        
        # Verify the page was added by retrieving the user
        updated_user = user_collection.find_one({"_id": ObjectId(current_user["_id"])})
        page_count = len(updated_user.get('notebook_pages', []))
        print(f"User now has {page_count} pages")
        
        return page_dict
    except Exception as e:
        print(f"Error creating page: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating page: {str(e)}"
        )

@router.put("/pages/{page_id}", response_model=NotebookPage)
async def update_page(page_id: str, updated_page: NotebookPage, current_user = Depends(get_current_user)):
    try:
        print(f"Updating page: {page_id}")
        print(f"Updated page data received: name={updated_page.name}")
        print(f"Canvas data length: {len(updated_page.canvas_data or '') if updated_page.canvas_data else 'None'}")
        
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
            
        # Update the page - handle both field naming conventions
        page_dict = updated_page.model_dump()
        
        # Ensure canvas_data is properly set
        if not page_dict.get("canvas_data") and page_dict.get("canvasData"):
            page_dict["canvas_data"] = page_dict["canvasData"]
        
        # Handle date field
        if isinstance(page_dict.get("date_created"), str):
            try:
                # Try to parse as ISO format first
                page_dict["date_created"] = datetime.fromisoformat(
                    page_dict["date_created"].replace("Z", "+00:00")
                )
                print(f"Converted date from string: {page_dict['date_created']}")
            except (ValueError, TypeError):
                # Default to current date if parsing fails
                page_dict["date_created"] = datetime.now()
                print("Using current datetime for date_created")
        
        # Update in database
        result = user_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {f"notebook_pages.{page_index}": page_dict}}
        )
        
        print(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
        return page_dict
    except Exception as e:
        print(f"Error updating page: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating page: {str(e)}"
        )

@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(page_id: str, current_user = Depends(get_current_user)):
    user_collection = get_collection("users")
    
    # Remove the page from the user's notebook_pages array
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$pull": {"notebook_pages": {"id": page_id}}}
    )
    
    return None