"""
Main FastAPI application module for the backend API.
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import config
from config import config

# Create FastAPI app
app = FastAPI(
    title="Dropshipping Automation API",
    description="API for dropshipping automation platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Models
class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str

class ConfigResponse(BaseModel):
    apiPrefix: str
    apiVersion: str
    debug: bool

class ErrorResponse(BaseModel):
    error: str
    message: str
    status: int

# API Routes
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": os.getenv("FASTAPI_ENV", "development")
    }

@app.get("/api/config", response_model=ConfigResponse)
def get_public_config():
    """Get public configuration"""
    return {
        "apiPrefix": config.API_PREFIX,
        "apiVersion": config.API_V1_STR,
        "debug": config.DEBUG
    }

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "status": 404
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "status": 500
        }
    )

if __name__ == "__main__":
    # Run the app with uvicorn
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("fast_api:app", host="0.0.0.0", port=port, reload=True)