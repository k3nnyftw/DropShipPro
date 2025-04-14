"""
Application monitoring, metrics, and health checks for production.
"""

import time
import logging
import os
import psutil
import platform
from typing import Dict, Any, List, Optional
from flask import Flask, request, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import multiprocess, CollectorRegistry
from functools import wraps
from sqlalchemy.engine import Engine
from sqlalchemy import event
from config import config

# Configure logging
logger = logging.getLogger(__name__)

# Create metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, float('inf'))
)

DB_QUERY_LATENCY = Histogram(
    'db_query_duration_seconds',
    'Database query latency in seconds',
    ['query_type'],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5, 1.0, float('inf'))
)

ERROR_COUNT = Counter(
    'http_request_errors_total',
    'Total number of HTTP request errors',
    ['method', 'endpoint', 'error_type']
)

CACHE_HIT = Counter(
    'cache_hit_total',
    'Total number of cache hits',
    ['cache_type']
)

CACHE_MISS = Counter(
    'cache_miss_total',
    'Total number of cache misses',
    ['cache_type']
)

# System metrics
CPU_USAGE = Gauge(
    'system_cpu_usage_percent',
    'System CPU usage in percent'
)

MEMORY_USAGE = Gauge(
    'system_memory_usage_bytes',
    'System memory usage in bytes'
)

DISK_USAGE = Gauge(
    'system_disk_usage_bytes',
    'System disk usage in bytes',
    ['mount_point']
)

ACTIVE_CONNECTIONS = Gauge(
    'db_active_connections',
    'Number of active database connections'
)

# Worker metrics
WORKER_COUNT = Gauge(
    'worker_count',
    'Number of worker processes'
)

class MonitoringManager:
    """Manager for application monitoring and metrics."""
    
    @staticmethod
    def init_monitoring(app: Flask):
        """
        Initialize monitoring for a Flask application.
        
        Args:
            app: Flask application
        """
        # Initialize multiprocess metrics if running with Gunicorn
        if 'prometheus_multiproc_dir' in os.environ:
            os.makedirs(os.environ['prometheus_multiproc_dir'], exist_ok=True)
            registry = CollectorRegistry()
            multiprocess.MultiProcessCollector(registry)
        
        # Add metrics endpoint
        @app.route('/metrics')
        def metrics():
            if 'prometheus_multiproc_dir' in os.environ:
                registry = CollectorRegistry()
                multiprocess.MultiProcessCollector(registry)
                return Response(generate_latest(registry), mimetype=CONTENT_TYPE_LATEST)
            return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
        
        # Add request metrics middleware
        @app.before_request
        def before_request():
            request.start_time = time.time()
        
        @app.after_request
        def after_request(response):
            if hasattr(request, 'start_time'):
                request_latency = time.time() - request.start_time
                endpoint = request.endpoint or 'unknown'
                REQUEST_COUNT.labels(
                    method=request.method,
                    endpoint=endpoint,
                    status_code=response.status_code
                ).inc()
                REQUEST_LATENCY.labels(
                    method=request.method,
                    endpoint=endpoint
                ).observe(request_latency)
                
                # Add response time header
                response.headers['X-Response-Time'] = f"{request_latency:.6f}"
            
            return response
        
        # Add error metrics
        @app.errorhandler(Exception)
        def handle_error(error):
            error_type = type(error).__name__
            endpoint = request.endpoint or 'unknown'
            ERROR_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                error_type=error_type
            ).inc()
            # Let the regular error handler continue
            raise error
        
        # Start background metrics collection
        if not app.debug:
            MonitoringManager.start_system_metrics_collection()
    
    @staticmethod
    def start_system_metrics_collection():
        """Start collecting system metrics in the background."""
        import threading
        
        def collect_system_metrics():
            while True:
                # Collect CPU usage
                CPU_USAGE.set(psutil.cpu_percent(interval=1))
                
                # Collect memory usage
                memory = psutil.virtual_memory()
                MEMORY_USAGE.set(memory.used)
                
                # Collect disk usage
                for partition in psutil.disk_partitions():
                    if not partition.mountpoint.startswith('/snap'):  # Skip snap mounts
                        try:
                            usage = psutil.disk_usage(partition.mountpoint)
                            DISK_USAGE.labels(mount_point=partition.mountpoint).set(usage.used)
                        except (PermissionError, OSError):
                            pass
                
                # Collect worker count (for gunicorn)
                if 'GUNICORN_CMD_ARGS' in os.environ:
                    try:
                        # Count processes with gunicorn in the name
                        count = 0
                        for proc in psutil.process_iter(['name']):
                            if 'gunicorn' in proc.info['name']:
                                count += 1
                        WORKER_COUNT.set(count)
                    except (psutil.AccessDenied, psutil.NoSuchProcess):
                        pass
                
                # Sleep for 15 seconds before next collection
                time.sleep(15)
        
        # Start metric collection in a background thread
        metrics_thread = threading.Thread(target=collect_system_metrics, daemon=True)
        metrics_thread.start()
    
    @staticmethod
    def track_db_query_time(engine: Engine):
        """
        Track database query time using SQLAlchemy event listeners.
        
        Args:
            engine: SQLAlchemy engine
        """
        @event.listens_for(engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            conn.info.setdefault('query_start_time', []).append(time.time())
        
        @event.listens_for(engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            start_time = conn.info['query_start_time'].pop()
            query_time = time.time() - start_time
            
            # Determine query type (SELECT, INSERT, UPDATE, DELETE, etc.)
            query_type = statement.split(' ', 1)[0].upper() if statement else 'UNKNOWN'
            
            DB_QUERY_LATENCY.labels(query_type=query_type).observe(query_time)
    
    @staticmethod
    def track_cache_metrics(hit: bool, cache_type: str = 'redis'):
        """
        Track cache hit/miss metrics.
        
        Args:
            hit: True if cache hit, False if cache miss
            cache_type: Type of cache (e.g., 'redis', 'memcached')
        """
        if hit:
            CACHE_HIT.labels(cache_type=cache_type).inc()
        else:
            CACHE_MISS.labels(cache_type=cache_type).inc()
    
    @staticmethod
    def get_system_info() -> Dict[str, Any]:
        """
        Get system information for diagnostics.
        
        Returns:
            Dict with system information
        """
        return {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total_gb': round(psutil.virtual_memory().total / (1024**3), 2),
            'hostname': platform.node(),
            'uptime_seconds': int(time.time() - psutil.boot_time()),
            'environment': os.getenv('FLASK_ENV', 'development')
        }