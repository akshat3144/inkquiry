from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from constants import MONGO_URI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = None

def get_database():
    global client
    if client is None:
        try:
            logger.info(f"Connecting to MongoDB at {MONGO_URI if MONGO_URI != 'mongodb://localhost:27017' else 'default localhost'}")
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            
            # Verify connection is working
            client.admin.command('ping')
            logger.info("MongoDB connection successful")
            
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {str(e)}")
            raise
        except ServerSelectionTimeoutError as e:
            logger.error(f"MongoDB server selection timeout: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected MongoDB error: {str(e)}")
            raise
            
    return client["inkquiry"]

def get_collection(collection_name):
    try:
        db = get_database()
        collection = db[collection_name]
        logger.info(f"Accessing collection: {collection_name}")
        return collection
    except Exception as e:
        logger.error(f"Error accessing collection {collection_name}: {str(e)}")
        raise