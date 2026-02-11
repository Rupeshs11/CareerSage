from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_mongodb():
    # Use the URI from environment or the default
    uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/careersage')
    print(f"Connecting to: {uri}")
    
    try:
        client = MongoClient(uri)
        # The database name is usually at the end of the URI or defaults to 'careersage'
        db_name = uri.split('/')[-1] if '/' in uri else 'careersage'
        if '?' in db_name:
            db_name = db_name.split('?')[0]
            
        db = client[db_name]
        
        print(f"\nConnected to database: {db_name}")
        
        collections = db.list_collection_names()
        if not collections:
            print("No collections found. The database might be empty.")
            return

        print("\nCollections and Document Counts:")
        print("-" * 30)
        for collection_name in collections:
            count = db[collection_name].count_documents({})
            print(f"- {collection_name}: {count} documents")
            
            # Show a sample document if it exists
            if count > 0:
                sample = db[collection_name].find_one()
                # Simplified print for sample
                print(f"  Sample ID: {sample.get('_id')}")
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    check_mongodb()
