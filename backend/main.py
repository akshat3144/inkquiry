from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from apps.calculator.route import router as calculator_router
from apps.auth.route import router as auth_router
from apps.notebook.route import router as notebook_router
from constants import SERVER_URL, PORT, ENV

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MongoDB connection
    from db.mongo import get_database
    get_database()
    yield

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def root():
    return {"message": "Server is running"}

app.include_router(calculator_router, prefix="/calculate", tags=["calculate"])
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(notebook_router, prefix="/notebook", tags=["notebook"])


if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_URL, port=int(PORT), reload=(ENV == "dev"))