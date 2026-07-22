from flask import Blueprint, request, jsonify
from db import db

centers_bp = Blueprint('centers', __name__)

@centers_bp.route('', methods=['GET'])
def get_centers():
    service_type = request.args.get('type') # e.g. "Car Repair", "Car Wash", "Car Detailing"
    centers_cursor = db.centers.find()
    
    centers_list = []
    for center in centers_cursor:
        # Simple local filtering if query param is set
        if service_type:
            # Match service category roughly
            services_offered = center.get('services', [])
            matched = False
            for s in services_offered:
                if service_type.lower() in s.lower():
                    matched = True
                    break
            if not matched:
                continue

        centers_list.append({
            "id": str(center['_id']),
            "name": center['name'],
            "image": center.get('image'),
            "rating": center.get('rating', 5.0),
            "reviews_count": center.get('reviews_count', 0),
            "address": center.get('address'),
            "lat": center.get('lat'),
            "lng": center.get('lng'),
            "phone": center.get('phone'),
            "pricing": center.get('pricing', "$$"),
            "services": center.get('services', []),
            "operating_hours": center.get('operating_hours', "09:00 AM - 06:00 PM")
        })

    return jsonify(centers_list), 200

@centers_bp.route('/<center_id>', methods=['GET'])
def get_center_details(center_id):
    center = db.centers.find_one({"_id": center_id})
    if not center:
        return jsonify({"error": "Service center not found"}), 404

    return jsonify({
        "id": str(center['_id']),
        "name": center['name'],
        "image": center.get('image'),
        "rating": center.get('rating', 5.0),
        "reviews_count": center.get('reviews_count', 0),
        "address": center.get('address'),
        "lat": center.get('lat'),
        "lng": center.get('lng'),
        "phone": center.get('phone'),
        "pricing": center.get('pricing', "$$"),
        "services": center.get('services', []),
        "operating_hours": center.get('operating_hours', "09:00 AM - 06:00 PM")
    }), 200

@centers_bp.route('/services', methods=['GET'])
def get_services():
    services_cursor = db.services.find()
    services_list = []
    for service in services_cursor:
        services_list.append({
            "id": str(service['_id']),
            "name": service['name'],
            "category": service['category'],
            "price": service['price'],
            "estimated_time": service.get('estimated_time', "2 hours"),
            "description": service.get('description', "")
        })
    return jsonify(services_list), 200
