"""
Flask Extensions
Centralized initialization of Flask extensions
"""
import flask
try:
    from flask.json import JSONEncoder
except ImportError:
    # Flask 3.0 compatibility fix for flask-mongoengine
    import json
    class JSONEncoder(json.JSONEncoder):
        pass
    flask.json.JSONEncoder = JSONEncoder
    # Also patch the Flask class to prevent the AttributeError
    if not hasattr(flask.Flask, 'json_encoder'):
        flask.Flask.json_encoder = JSONEncoder

from flask_mongoengine import MongoEngine
import flask_mongoengine.json
# Bypassing the broken JSON encoder override in Flask 3.0
flask_mongoengine.json.override_json_encoder = lambda app: None
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO

# Database (MongoDB)
db = MongoEngine()

# JWT Authentication
jwt = JWTManager()

# CORS
cors = CORS()

# Socket.IO for real-time battles
socketio = SocketIO()
