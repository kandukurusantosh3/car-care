import os
import json
from pymongo import MongoClient

# Make sure this matches the one in .env
MONGO_URI = 'mongodb+srv://santhosh:Santosh786@cluster0.xhhmwug.mongodb.net/car_service?appName=Cluster0'
FALLBACK_DB_PATH = 'data/db_fallback.json'

def migrate():
    print('Connecting to MongoDB Atlas...')
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = client.get_default_database()

    try:
        client.admin.command('ping')
        print(f'Connected successfully to database: {db.name}')
    except Exception as e:
        print('Failed to connect:', e)
        return

    if os.path.exists(FALLBACK_DB_PATH):
        print(f'Loading data from {FALLBACK_DB_PATH}...')
        with open(FALLBACK_DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for collection_name, documents in data.items():
            if documents:
                collection = db[collection_name]
                # Clear existing data first
                collection.delete_many({})
                print(f'Inserting {len(documents)} documents into `{collection_name}` collection...')
                collection.insert_many(documents)
                print(f'Success for `{collection_name}`!')
                
        print('\n--- DATA MIGRATION COMPLETE! ---')
        print('All your data has been successfully pushed to MongoDB Atlas.')
    else:
        print('Fallback database file not found. Nothing to migrate.')

if __name__ == '__main__':
    migrate()
