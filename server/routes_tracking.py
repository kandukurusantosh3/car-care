from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_tracking(booking_id):
    user_id = get_jwt_identity()
    booking = db.bookings.find_one({"_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Fetch center coordinate details
    center = db.centers.find_one({"_id": booking["center_id"]})
    center_lat = center.get("lat", 12.9716) if center else 12.9716
    center_lng = center.get("lng", 77.5946) if center else 77.5946

    # Determine status and mock dynamic driver location coordinates
    status = booking.get("status", "Confirmed")
    driver_coordinates = None
    driver_name = "Ramesh Kumar"
    driver_phone = "+1 (555) 019-8732"

    if status == "Picked Up":
        # Valet driving towards garage: mock location offset
        driver_coordinates = {
            "lat": center_lat + 0.005,
            "lng": center_lng - 0.004,
            "status": "Driving to Service Center"
        }
    elif status == "Ready for Delivery":
        # Valet delivering car back: mock location offset
        driver_coordinates = {
            "lat": center_lat - 0.003,
            "lng": center_lng + 0.006,
            "status": "Driving to Customer Address"
        }
    elif status in ["In Garage", "Work in Progress"]:
        # Stationary at service center
        driver_coordinates = {
            "lat": center_lat,
            "lng": center_lng,
            "status": "At Workshop"
        }
        driver_name = "Alex (Mechanic)"
        driver_phone = center.get("phone", "+1 (555) 019-2831") if center else driver_phone

    return jsonify({
        "booking_id": booking_id,
        "status": status,
        "driver_name": driver_name,
        "driver_phone": driver_phone,
        "driver_location": driver_coordinates,
        "center_location": {
            "lat": center_lat,
            "lng": center_lng
        },
        "timeline": booking.get("timeline", [])
    }), 200
