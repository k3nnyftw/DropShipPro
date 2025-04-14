"""
Gunicorn configuration for production deployment.
"""

import multiprocessing
import os

# Bind to 0.0.0.0 to listen on all interfaces
bind = "0.0.0.0:" + os.getenv("PORT", "5000")

# Number of worker processes
# Use the recommended formula: 2 * number of CPUs + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Use the Gevent worker type for asynchronous handling
worker_class = "gevent"

# Maximum requests a worker will process before restarting
# This helps prevent memory leaks
max_requests = 1000
max_requests_jitter = 100

# Timeout for worker processes (in seconds)
timeout = 60

# Keep the connection alive for reuse
keepalive = 5

# Access log configuration
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Process name
proc_name = "dropshipping_api"

# Preload application for faster worker startup
preload_app = True

# Daemonize the Gunicorn process
daemon = False

# Graceful shutdown timeout
graceful_timeout = 30

# Connection limit
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190