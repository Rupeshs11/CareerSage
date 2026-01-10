"""
CareerSage Backend - Flask Application Factory
"""
from flask import Flask, jsonify
from .config import config
from .extensions import db, migrate, jwt, cors


def create_app(config_name='default'):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Register blueprints (routes)
    from .routes.auth import auth_bp
    from .routes.roadmaps import roadmaps_bp
    from .routes.quiz import quiz_bp
    from .routes.dashboard import dashboard_bp
    from .routes.ai import ai_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(roadmaps_bp, url_prefix='/api/roadmaps')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'name': 'CareerSage API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth',
                'roadmaps': '/api/roadmaps',
                'quiz': '/api/quiz',
                'dashboard': '/api/dashboard',
                'ai': '/api/ai'
            }
        })
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'CareerSage API is running'
        })
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please log in again'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'Token verification failed'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Please provide a valid access token'
        }), 401
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
