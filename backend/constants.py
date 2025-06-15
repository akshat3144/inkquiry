from dotenv import load_dotenv
import os
load_dotenv()

SERVER_URL = 'localhost'
PORT = '8900'
ENV = 'dev'

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Add MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-placeholder")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours