"""
Flask Extensions
Centralized initialization of Flask extensions
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Database
db = SQLAlchemy()

# Database migrations
migrate = Migrate()

# JWT Authentication
jwt = JWTManager()

# CORS
cors = CORS()
