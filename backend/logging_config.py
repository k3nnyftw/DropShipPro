"""
Logging configuration for the backend API.

Implements structured logging with JSON output suitable for log aggregation
platforms like ELK Stack, DataDog, or New Relic.
"""

import os
import logging
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pythonjsonlogger import jsonlogger

# Load environment variables
env = os.getenv("FLASK_ENV", "development")

# Define log directory
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Log file paths
APP_LOG = os.path.join(LOG_DIR, "app.log")
ERROR_LOG = os.path.join(LOG_DIR, "error.log")
ACCESS_LOG = os.path.join(LOG_DIR, "access.log")

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """
    Custom JSON formatter for structured logging.
    """
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['module'] = record.module
        log_record['function'] = record.funcName
        log_record['line'] = record.lineno
        log_record['environment'] = env

def configure_logging():
    """
    Configure logging for the application.
    """
    # Create formatters
    console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    json_formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(module)s %(function)s %(line)s %(message)s')
    
    # Create handlers
    # 1. Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(logging.INFO)
    
    # 2. File handlers with rotation
    # 2.1. App log - rotate daily, keep 30 days of logs
    app_handler = TimedRotatingFileHandler(
        APP_LOG, 
        when='midnight', 
        interval=1, 
        backupCount=30
    )
    app_handler.setFormatter(json_formatter)
    app_handler.setLevel(logging.INFO)
    
    # 2.2. Error log - rotate when size reaches 10 MB, keep 20 files
    error_handler = RotatingFileHandler(
        ERROR_LOG, 
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=20
    )
    error_handler.setFormatter(json_formatter)
    error_handler.setLevel(logging.ERROR)
    
    # 2.3. Access log - rotate daily, keep 60 days of logs
    access_handler = TimedRotatingFileHandler(
        ACCESS_LOG, 
        when='midnight', 
        interval=1, 
        backupCount=60
    )
    access_handler.setFormatter(json_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(app_handler)
    root_logger.addHandler(error_handler)
    
    # Configure access logger
    access_logger = logging.getLogger('api.access')
    access_logger.setLevel(logging.INFO)
    access_logger.addHandler(access_handler)
    
    # Remove propagation for access logger
    access_logger.propagate = False
    
    # Set SQLAlchemy logger level
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return {
        'root': root_logger,
        'access': access_logger
    }

def log_request(logger, request, response=None, error=None):
    """
    Log an API request with structured data.
    
    Args:
        logger: Logger instance
        request: Flask/FastAPI request object
        response: Response object (optional)
        error: Error information (optional)
    """
    log_data = {
        'method': request.method,
        'path': request.path,
        'remote_addr': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', ''),
    }
    
    # Add response info if available
    if response:
        log_data['status_code'] = response.status_code
        log_data['content_length'] = response.headers.get('Content-Length', 0)
        log_data['response_time_ms'] = response.headers.get('X-Response-Time', 0)
    
    # Add error info if available
    if error:
        log_data['error'] = str(error)
        log_data['error_type'] = type(error).__name__
    
    # Log as JSON
    logger.info('API Request', extra=log_data)