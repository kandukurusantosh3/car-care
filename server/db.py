import os
import json
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fallback JSON path
FALLBACK_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'db_fallback.json')

class MockCollection:
    def __init__(self, db_path, collection_name):
        self.db_path = db_path
        self.name = collection_name

    def _load(self):
        if not os.path.exists(self.db_path):
            return []
        try:
            with open(self.db_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if not content:
                    return []
                return json.loads(content).get(self.name, [])
        except Exception as e:
            logger.error(f"Error reading mock DB collection {self.name}: {e}")
            return []

    def _save(self, data):
        all_data = {}
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if content:
                        all_data = json.loads(content)
            except Exception as e:
                logger.error(f"Error loading mock DB for write: {e}")
        
        all_data[self.name] = data
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        try:
            with open(self.db_path, 'w', encoding='utf-8') as f:
                json.dump(all_data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error writing mock DB collection {self.name}: {e}")

    def find_one(self, query=None, projection=None):
        query = query or {}
        items = self._load()
        for item in items:
            match = True
            for k, v in query.items():
                if k == "$or":
                    or_match = False
                    for cond in v:
                        cond_match = True
                        for cond_k, cond_v in cond.items():
                            # String comparison for comparison queries
                            item_val = str(item.get(cond_k)) if item.get(cond_k) is not None else None
                            cond_val = str(cond_v) if cond_v is not None else None
                            if item_val != cond_val:
                                cond_match = False
                                break
                        if cond_match:
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                else:
                    item_val = str(item.get(k)) if item.get(k) is not None else None
                    cond_val = str(v) if v is not None else None
                    if item_val != cond_val:
                        match = False
                        break
            if match:
                res = dict(item)
                if projection:
                    for pk, pv in projection.items():
                        if pv == 0:
                            res.pop(pk, None)
                return res
        return None

    def find(self, query=None):
        query = query or {}
        items = self._load()
        results = []
        for item in items:
            match = True
            for k, v in query.items():
                if k == "$or":
                    or_match = False
                    for cond in v:
                        cond_match = True
                        for cond_k, cond_v in cond.items():
                            item_val = str(item.get(cond_k)) if item.get(cond_k) is not None else None
                            cond_val = str(cond_v) if cond_v is not None else None
                            if item_val != cond_val:
                                cond_match = False
                                break
                        if cond_match:
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                else:
                    item_val = str(item.get(k)) if item.get(k) is not None else None
                    cond_val = str(v) if v is not None else None
                    if item_val != cond_val:
                        match = False
                        break
            if match:
                results.append(dict(item))
        return results

    def insert_one(self, doc):
        items = self._load()
        if "_id" not in doc:
            doc["_id"] = str(ObjectId())
        else:
            doc["_id"] = str(doc["_id"])
        
        serializable_doc = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                serializable_doc[k] = str(v)
            else:
                serializable_doc[k] = v

        items.append(serializable_doc)
        self._save(items)

        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(serializable_doc["_id"])

    def update_one(self, query, update):
        items = self._load()
        matched = False
        set_dict = update.get("$set", {})
        push_dict = update.get("$push", {})

        for item in items:
            match = True
            for k, v in query.items():
                item_val = str(item.get(k)) if item.get(k) is not None else None
                cond_val = str(v) if v is not None else None
                if item_val != cond_val:
                    match = False
                    break
            if match:
                matched = True
                for sk, sv in set_dict.items():
                    serializable_val = str(sv) if isinstance(sv, ObjectId) else sv
                    item[sk] = serializable_val
                for pk, pv in push_dict.items():
                    if pk not in item:
                        item[pk] = []
                    serializable_val = str(pv) if isinstance(pv, ObjectId) else pv
                    item[pk].append(serializable_val)
                break

        if matched:
            self._save(items)

        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(1 if matched else 0, 1 if matched else 0)

class MockDB:
    def __init__(self, db_path):
        self.db_path = db_path
        # Create seed data for service centers and default services if database file doesn't exist
        self._initialize_seed_data()

    def _initialize_seed_data(self):
        should_seed = False
        existing_data = {}
        if not os.path.exists(self.db_path):
            should_seed = True
        else:
            try:
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if not content.strip():
                        should_seed = True
                    else:
                        existing_data = json.loads(content)
                        if not existing_data.get("centers") or not existing_data.get("services"):
                            should_seed = True
            except Exception:
                should_seed = True

        if should_seed:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            # Default mock service centers
            seed_centers = [
                {
                    "_id": "center_1",
                    "name": "Apex Auto Care & Repairs",
                    "image": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
                    "rating": 4.8,
                    "reviews_count": 142,
                    "address": "120 Industrial Boulevard, Cityville",
                    "lat": 12.9716,
                    "lng": 77.5946,
                    "phone": "+1 (555) 019-2831",
                    "pricing": "$$",
                    "services": ["Car Repair", "Denting & Painting"],
                    "operating_hours": "08:00 AM - 07:00 PM"
                },
                {
                    "_id": "center_2",
                    "name": "Elite Car Wash & Detailing Lounge",
                    "image": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80",
                    "rating": 4.9,
                    "reviews_count": 89,
                    "address": "45 Ocean Breeze Parkway, Cityville",
                    "lat": 12.9782,
                    "lng": 77.6012,
                    "phone": "+1 (555) 019-9481",
                    "pricing": "$$$",
                    "services": ["Car Wash", "Car Detailing"],
                    "operating_hours": "09:00 AM - 09:00 PM"
                },
                {
                    "_id": "center_3",
                    "name": "Pro Mechanic Solutions",
                    "image": "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=600&q=80",
                    "rating": 4.6,
                    "reviews_count": 215,
                    "address": "812 Motorway Avenue, Suburbia",
                    "lat": 12.9641,
                    "lng": 77.5855,
                    "phone": "+1 (555) 019-3344",
                    "pricing": "$",
                    "services": ["Car Repair"],
                    "operating_hours": "07:30 AM - 06:00 PM"
                }
            ]

            seed_services = [
                {
                    "_id": "srv_1",
                    "name": "General Diagnostic & Oil Service",
                    "category": "Car Repair",
                    "price": 120.00,
                    "estimated_time": "2 hours",
                    "description": "Full engine diagnostic, synthetic oil filter swap, top-up of coolant, brake, and washer fluids."
                },
                {
                    "_id": "srv_2",
                    "name": "Advanced AC Leak Fix & Gas Recharge",
                    "category": "Car Repair",
                    "price": 180.00,
                    "estimated_time": "3 hours",
                    "description": "Pressure testing the AC lines, vacuum testing, leak sealant injection, and full R134a/R1234yf refrigerant recharge."
                },
                {
                    "_id": "srv_3",
                    "name": "Premium Ceramic Paint Protection & Detail",
                    "category": "Car Detailing",
                    "price": 350.00,
                    "estimated_time": "6 hours",
                    "description": "Multi-stage clay bar treatment, dual-action machine paint correction, and application of a high-gloss 9H ceramic coating protection layer."
                },
                {
                    "_id": "srv_4",
                    "name": "Eco Steam Interior & Exterior Wash",
                    "category": "Car Wash",
                    "price": 45.00,
                    "estimated_time": "1 hour",
                    "description": "High-pressure exterior steam washing, tire shine, deep dash wipe, interior vacuuming, and deodorizing."
                },
                {
                    "_id": "srv_5",
                    "name": "Bumper Scratch Denting & Painting",
                    "category": "Denting & Painting",
                    "price": 220.00,
                    "estimated_time": "1 day",
                    "description": "Denting extraction, body-filler smooth matching, factory color matching paint, and UV-resistant gloss clear coat application."
                }
            ]

            all_data = {
                "centers": seed_centers,
                "services": seed_services,
                "users": existing_data.get("users", []),
                "bookings": existing_data.get("bookings", []),
                "vehicles": existing_data.get("vehicles", [])
            }
            with open(self.db_path, 'w', encoding='utf-8') as f:
                json.dump(all_data, f, indent=2, default=str)

    def __getattr__(self, name):
        return MockCollection(self.db_path, name)

# Try connecting to MongoDB, fallback to MockDB if it fails
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/car_service_db")
db = None

try:
    # Set connection timeout to 2 seconds for faster fallback
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    # Trigger a command to test connection
    client.admin.command('ping')
    db = client.get_default_database()
    logger.info("Successfully connected to MongoDB!")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    logger.warning(f"MongoDB connection failed: {e}. Falling back to JSON database at {FALLBACK_DB_PATH}")
    db = MockDB(FALLBACK_DB_PATH)
