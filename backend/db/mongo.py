from pymongo import MongoClient
from constants import MONGO_URI

client = None

def get_database():
    global client
    if client is None:
        client = MongoClient(MONGO_URI)
    return client["inkquiry"]

def get_collection(collection_name):
    db = get_database()
    return db[collection_name]