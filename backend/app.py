"""
Main Flask application module for the backend API.
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import config
from config import config

# Create Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

# Configure app
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['DEBUG'] = config.DEBUG

# API routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "version": "1.0.0",
        "environment": os.getenv("FLASK_ENV", "development")
    })

@app.route('/api/config', methods=['GET'])
def get_public_config():
    """Get public configuration"""
    return jsonify({
        "apiPrefix": config.API_PREFIX,
        "apiVersion": config.API_V1_STR,
        "debug": config.DEBUG
    })

# Import API routes
# from routes import register_routes
# register_routes(app)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not Found",
        "message": "The requested resource was not found",
        "status": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred",
        "status": 500
    }), 500

if __name__ == '__main__':
    # Run the app
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port)