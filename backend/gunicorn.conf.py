"""
Gunicorn configuration for CareerSage (eventlet mode).

CRITICAL: eventlet.monkey_patch() MUST happen before gunicorn
loads the application, otherwise 'requests' and other stdlib
modules will block the single eventlet worker and cause timeouts
on AWS (production) even though it works locally with socketio.run().
"""
import eventlet
eventlet.monkey_patch()

# Server socket
bind = "0.0.0.0:5000"

# Worker processes — eventlet uses green threads inside 1 worker
worker_class = "eventlet"
workers = 1

# Timeout — allow enough time for AI API calls (40s API timeout + overhead)
timeout = 180
graceful_timeout = 60
keep_alive = 65

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Preload app so monkey_patch is applied before import
preload_app = False
