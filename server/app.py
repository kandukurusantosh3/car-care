'''server/app.py - main api app declaration'''
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Import blueprints
from routes_auth import auth_bp
from routes_centers import centers_bp
from routes_bookings import bookings_bp
from routes_tracking import tracking_bp

'''Main wrapper for app creation'''
app = Flask(__name__, static_folder='../build')
CORS(app)

from datetime import timedelta

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret-key-1234')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

##
# API routes
##
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(centers_bp, url_prefix='/api/centers')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(tracking_bp, url_prefix='/api/tracking')

##
# View route
##

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    '''Return index.html for all non-api routes'''
    #pylint: disable=unused-argument
    
    # If file exists in static folder (like index.html, main.js, styles.css)
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 7082))
    app.run(host='0.0.0.0', port=port, debug=True)