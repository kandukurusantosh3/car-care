from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from bson import ObjectId
from db import db

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'customer') # 'customer' or 'mechanic' or 'admin'

    if not name or not email or not phone or not password:
        return jsonify({"error": "Missing required fields (name, email, phone, password)"}), 400

    # Check if user already exists
    existing_user = db.users.find_one({
        "$or": [
            {"email": email},
            {"phone": phone}
        ]
    })
    if existing_user:
        return jsonify({"error": "User with this email or phone already exists"}), 400

    # Hash the password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = {
        "_id": str(ObjectId()),
        "name": name,
        "email": email,
        "phone": phone,
        "password_hash": password_hash,
        "role": role
    }

    db.users.insert_one(new_user)
    
    # Generate access token
    access_token = create_access_token(identity=str(new_user["_id"]))

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": {
            "id": str(new_user["_id"]),
            "name": name,
            "email": email,
            "phone": phone,
            "role": role
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = db.users.find_one({"email": email})
    if not user or not bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user['_id']))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": str(user['_id']),
            "name": user['name'],
            "email": user['email'],
            "phone": user['phone'],
            "role": user.get('role', 'customer')
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = db.users.find_one({"_id": current_user_id}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": str(user['_id']),
            "name": user['name'],
            "email": user['email'],
            "phone": user['phone'],
            "role": user.get('role', 'customer')
        }
    }), 200
