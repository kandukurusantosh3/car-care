from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import datetime
from db import db

bookings_bp = Blueprint('bookings', __name__)

# --- Vehicle Garage Routes ---

@bookings_bp.route('/vehicles', methods=['POST'])
@jwt_required()
def add_vehicle():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    make = data.get('make')
    model = data.get('model')
    year = data.get('year')
    license_plate = data.get('license_plate')
    color = data.get('color', '')

    if not make or not model or not year or not license_plate:
        return jsonify({"error": "Missing required fields (make, model, year, license_plate)"}), 400

    new_vehicle = {
        "_id": str(ObjectId()),
        "user_id": user_id,
        "make": make,
        "model": model,
        "year": year,
        "license_plate": license_plate,
        "color": color
    }

    db.vehicles.insert_one(new_vehicle)

    return jsonify({
        "message": "Vehicle added to garage",
        "vehicle": new_vehicle
    }), 201

@bookings_bp.route('/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    user_id = get_jwt_identity()
    vehicles = db.vehicles.find({"user_id": user_id})
    return jsonify(vehicles), 200

# --- Booking Routes ---

@bookings_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    center_id = data.get('center_id')
    vehicle_id = data.get('vehicle_id')
    service_ids = data.get('service_ids', []) # List of service IDs selected
    scheduled_date = data.get('scheduled_date')
    scheduled_time = data.get('scheduled_time')
    pickup_option = data.get('pickup_option', False) # True or False

    if not center_id or not vehicle_id or not service_ids or not scheduled_date or not scheduled_time:
        return jsonify({"error": "Missing required fields (center_id, vehicle_id, service_ids, scheduled_date, scheduled_time)"}), 400

    # Retrieve center details
    center = db.centers.find_one({"_id": center_id})
    if not center:
        return jsonify({"error": "Service center not found"}), 404

    # Retrieve vehicle details
    vehicle = db.vehicles.find_one({"_id": vehicle_id, "user_id": user_id})
    if not vehicle:
        return jsonify({"error": "Vehicle not found in your garage"}), 404

    # Get selected services details
    selected_services = []
    total_price = 0.0
    for s_id in service_ids:
        srv = db.services.find_one({"_id": s_id})
        if srv:
            selected_services.append({
                "id": str(srv["_id"]),
                "name": srv["name"],
                "price": srv["price"]
            })
            total_price += srv["price"]

    if pickup_option:
        # Add flat pickup service charge
        total_price += 15.00

    new_booking = {
        "_id": str(ObjectId()),
        "user_id": user_id,
        "center_id": center_id,
        "center_name": center["name"],
        "vehicle": {
            "make": vehicle["make"],
            "model": vehicle["model"],
            "license_plate": vehicle["license_plate"]
        },
        "services": selected_services,
        "total_price": round(total_price, 2),
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "pickup_option": pickup_option,
        "status": "Confirmed", # Confirmed, Picked Up, In Garage, Work in Progress, Ready for Delivery, Completed
        "timeline": [
            {
                "status": "Confirmed",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p"),
                "description": "Your appointment is confirmed at " + center["name"]
            }
        ],
        "mechanic_notes": ""
    }

    db.bookings.insert_one(new_booking)

    return jsonify({
        "message": "Appointment booked successfully",
        "booking": new_booking
    }), 201

@bookings_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Mechanics and admins get to see all bookings in the queue
    if user.get('role') in ['mechanic', 'admin']:
        bookings = db.bookings.find()
    else:
        bookings = db.bookings.find({"user_id": user_id})
        
    return jsonify(bookings), 200

@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking_details(booking_id):
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    
    booking = db.bookings.find_one({"_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Authorization check
    if user.get('role') not in ['mechanic', 'admin'] and booking['user_id'] != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify(booking), 200

@bookings_bp.route('/<booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": user_id})
    if not user or user.get('role') not in ['mechanic', 'admin']:
        return jsonify({"error": "Unauthorized. Only mechanics and admins can update service statuses"}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    notes = data.get('notes', '')

    valid_statuses = ["Confirmed", "Picked Up", "In Garage", "Work in Progress", "Ready for Delivery", "Completed", "Cancelled"]
    if not new_status or new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of {valid_statuses}"}), 400

    booking = db.bookings.find_one({"_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Build description based on status
    status_descs = {
        "Confirmed": "Your appointment is confirmed.",
        "Picked Up": "Valet has picked up your vehicle.",
        "In Garage": "Your vehicle has arrived at the service center.",
        "Work in Progress": "Our mechanics are currently working on your vehicle.",
        "Ready for Delivery": "Service is complete! Your car is ready for pick up / delivery.",
        "Completed": "Service completed and car delivered.",
        "Cancelled": "Booking has been cancelled."
    }

    timeline_event = {
        "status": new_status,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "description": status_descs.get(new_status, f"Status updated to {new_status}")
    }

    db.bookings.update_one(
        {"_id": booking_id},
        {
            "$set": {"status": new_status, "mechanic_notes": notes},
            "$push": {"timeline": timeline_event}
        }
    )

    return jsonify({
        "message": f"Booking status updated to {new_status}",
        "status": new_status,
        "timeline_event": timeline_event
    }), 200
