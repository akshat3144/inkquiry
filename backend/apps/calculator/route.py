from fastapi import APIRouter
import base64
from io import BytesIO
from apps.calculator.utils import analyze_image
from schema import ImageData
from PIL import Image

router = APIRouter()

@router.post('')
async def run(data: ImageData):
    image_data = base64.b64decode(data.image.split(",")[1])  # Assumes data:image/png;base64,<data>
    image_bytes = BytesIO(image_data)
    image = Image.open(image_bytes)

    responses = analyze_image(image, dict_of_vars=data.dict_of_vars)

    # Store responses in a new list
    result_list = []
    for r in responses:
        result_list.append(r)

    # Print the entire list (instead of using `response` outside the loop)
    print("response in route:", responses)

    return {"message": "Image processed", "data": result_list, "status": "success"}