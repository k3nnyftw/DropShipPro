"""
Script to run the Flask application.
"""

import os
from dotenv import load_dotenv
from app import app
from database import init_db

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Initialize database
    init_db()
    
    # Run the app
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])