"""
CareerSage Backend Configuration
"""
import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Debug: Print JWT secret key (first 10 chars only) to verify it's loaded
print(f"[CONFIG] JWT_SECRET_KEY loaded: {os.getenv('JWT_SECRET_KEY', 'NOT SET')[:10]}...")


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Database (MongoDB)
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGODB_URI', 'mongodb://localhost:27017/careersage')
    }
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # AI Configuration (Ollama - optional)
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama2')
    
    # NVIDIA AI Configuration
    NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY', '')
    NVIDIA_BASE_URL = os.getenv('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1')
    NVIDIA_MODEL = os.getenv('NVIDIA_MODEL', 'nvidia/llama-3.1-nemotron-ultra-253b-v1')
    



class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
