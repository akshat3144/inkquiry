from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import time
from apps.calculator.route import router as calculator_router
from apps.auth.route import router as auth_router
from apps.notebook.route import router as notebook_router
from constants import SERVER_URL, PORT, ENV

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("inkquiry")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MongoDB connection
    from db.mongo import get_database
    logger.info("Initializing MongoDB connection")
    try:
        get_database()
        logger.info("MongoDB initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB: {str(e)}")
    yield

app = FastAPI(lifespan=lifespan)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(time.time())
    logger.info(f"[{request_id}] {request.method} {request.url.path} started")
    
    # Log request headers for debugging
    headers_log = {k: v for k, v in request.headers.items() if k.lower() in ['authorization', 'content-type', 'origin']}
    logger.info(f"[{request_id}] Headers: {headers_log}")
    
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"[{request_id}] {request.method} {request.url.path} completed in {process_time:.3f}s with status {response.status_code}")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"[{request_id}] {request.method} {request.url.path} failed after {process_time:.3f}s: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )

# Exception handler for unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred."}
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://inkquiry.onrender.com","http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Authorization"],
)


@app.get('/')
async def root():
    return {"message": "Server is running"}

app.include_router(calculator_router, prefix="/calculate", tags=["calculate"])
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(notebook_router, prefix="/notebook", tags=["notebook"])


if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_URL, port=int(PORT), reload=(ENV == "dev"))