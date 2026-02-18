"""CareerSage Backend - Flask Application Factory"""
import os
from flask import Flask, jsonify, send_from_directory, request
from .config import config
from .extensions import db, jwt, cors, socketio


def create_app(config_name='default'):
    """Create and configure the Flask application"""
    # Get the frontend directory path (relative to backend)
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))
    
    app = Flask(__name__, 
                static_folder=frontend_dir,
                static_url_path='')
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins="*", ping_timeout=60, ping_interval=25, async_mode='threading')
    
    # Register blueprints (routes)
    from .routes.auth import auth_bp
    from .routes.roadmaps import roadmaps_bp
    from .routes.quiz import quiz_bp
    from .routes.dashboard import dashboard_bp
    from .routes.ai import ai_bp
    from .routes.battle import battle_bp
    from .routes.friends import friends_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(roadmaps_bp, url_prefix='/api/roadmaps')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(battle_bp, url_prefix='/api/battle')
    app.register_blueprint(friends_bp, url_prefix='/api/friends')
    
    # Add request logging
    @app.before_request
    def log_request():
        if request.path.startswith('/api/'):
            print(f"\n{'='*60}")
            print(f"HTTP {request.method} {request.path}")
            print(f"{'='*60}\n")
            app.logger.info(f"{request.method} {request.path}")
    
    @app.after_request
    def log_response(response):
        if request.path.startswith('/api/'):
            print(f"Response: {response.status_code}\n")
        return response
    
    
    # Serve frontend pages
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_dir, 'index.html')
    
    @app.route('/<path:filename>')
    def serve_static(filename):
        # Check if file exists in frontend directory
        file_path = os.path.join(frontend_dir, filename)
        if os.path.isfile(file_path):
            return send_from_directory(frontend_dir, filename)
        # If it's a page without .html extension, try adding it
        if not filename.endswith('.html') and os.path.isfile(file_path + '.html'):
            return send_from_directory(frontend_dir, filename + '.html')
        # For HTML pages, serve the file
        return send_from_directory(frontend_dir, filename)
    
    # API info endpoint
    @app.route('/api')
    def api_info():
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
        app.logger.warning(f"[JWT] Token EXPIRED - payload: {jwt_payload}")
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please log in again'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        app.logger.error(f"[JWT] Token INVALID - error: {error}")
        return jsonify({
            'error': 'Invalid token',
            'message': f'Token verification failed: {error}'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        app.logger.warning(f"[JWT] Token MISSING - error: {error}")
        return jsonify({
            'error': 'Authorization required',
            'message': 'Please provide a valid access token'
        }), 401
    
    
    return app

