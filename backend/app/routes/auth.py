"""Authentication Routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from ..extensions import db
from ..models.user import User
from ..models.progress import UserProgress

from bson import ObjectId
from bson.errors import InvalidId


def safe_object_id(id_str):
    """Safely convert string to ObjectId."""
    if not id_str:
        return None
    try:
        return ObjectId(str(id_str))
    except (InvalidId, TypeError):
        return None

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    required_fields = ['email', 'password', 'name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    name = data['name'].strip()
    
    if '@' not in email or '.' not in email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    existing_user = User.objects(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        user = User(email=email, name=name)
        user.set_password(password)
        user.save()
        
        progress = UserProgress(user_id=user)
        progress.save()
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login and get access token."""
    data = request.get_json()
    
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.objects(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    user.update_last_login()
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile."""
    user_id = get_jwt_identity()
    user = User.objects(id=safe_object_id(user_id)).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user profile."""
    user_id = get_jwt_identity()
    user = User.objects(id=safe_object_id(user_id)).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name'].strip()
    
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    if 'current_password' in data and 'new_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        if len(data['new_password']) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        user.set_password(data['new_password'])
    
    try:
        user.save()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user."""
    return jsonify({'message': 'Logout successful'}), 200
