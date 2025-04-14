"""
Script to run the FastAPI application.
"""

import os
import uvicorn
from dotenv import load_dotenv
from database import init_db

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Initialize database
    init_db()
    
    # Run the app
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("fast_api:app", host="0.0.0.0", port=port, reload=True)