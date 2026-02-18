"""Roadmaps Routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.roadmap import Roadmap, UserRoadmap
from ..models.progress import UserProgress

from bson import ObjectId
from bson.errors import InvalidId

roadmaps_bp = Blueprint('roadmaps', __name__)


def safe_object_id(id_str):
    """Safely convert string to ObjectId."""
    if not id_str:
        return None
    try:
        return ObjectId(str(id_str))
    except (InvalidId, TypeError):
        return None


@roadmaps_bp.route('/', methods=['GET'])
def get_all_roadmaps():
    """Get all official roadmaps."""
    category = request.args.get('category')
    
    query = Roadmap.objects(is_published=True)
    
    if category:
        query = query.filter(category=category)
    
    roadmaps = query.order_by('-view_count').all()
    
    return jsonify({
        'roadmaps': [r.to_dict(include_content=False) for r in roadmaps],
        'total': len(roadmaps)
    }), 200


@roadmaps_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all roadmap categories."""
    categories = Roadmap.objects.distinct('category')
    return jsonify({
        'categories': [c for c in categories if c]
    }), 200


@roadmaps_bp.route('/<slug>', methods=['GET'])
def get_roadmap_by_slug(slug):
    """Get a single roadmap by slug."""
    roadmap = Roadmap.objects(slug=slug).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    roadmap.view_count += 1
    roadmap.save()
    
    return jsonify({'roadmap': roadmap.to_dict()}), 200


@roadmaps_bp.route('/id/<roadmap_id>', methods=['GET'])
def get_roadmap_by_id(roadmap_id):
    """Get a single roadmap by ID."""
    roadmap = Roadmap.objects(id=roadmap_id).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    return jsonify({'roadmap': roadmap.to_dict()}), 200


@roadmaps_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_roadmaps():
    """Get current user's saved roadmaps."""
    user_id = get_jwt_identity()
    
    roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id))\
        .order_by('-updated_at').all()
    
    return jsonify({
        'roadmaps': [r.to_dict() for r in roadmaps],
        'total': len(roadmaps)
    }), 200


@roadmaps_bp.route('/user', methods=['POST'])
@jwt_required()
def save_user_roadmap():
    """Save a new roadmap for the user."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    try:
        user_roadmap = UserRoadmap(
            user_id=safe_object_id(user_id),
            title=data['title'],
            description=data.get('description', ''),
            nodes=data.get('nodes', []),
            connections=data.get('connections', []),
            roadmap_id=safe_object_id(data.get('roadmap_id')),
            is_ai_generated=data.get('is_ai_generated', False),
            generation_params=data.get('generation_params')
        )
        
        user_roadmap.save()
        
        progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
        if progress:
            progress.total_roadmaps_started += 1
            progress.add_activity('roadmap_saved', f'Saved roadmap: {data["title"]}')
        
        return jsonify({
            'message': 'Roadmap saved successfully',
            'roadmap': user_roadmap.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to save roadmap', 'details': str(e)}), 500


@roadmaps_bp.route('/user/<roadmap_id>', methods=['GET'])
@jwt_required()
def get_user_roadmap(roadmap_id):
    """Get a specific user roadmap."""
    user_id = get_jwt_identity()
    
    roadmap = UserRoadmap.objects(
        id=safe_object_id(roadmap_id), 
        user_id=safe_object_id(user_id)
    ).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    return jsonify({'roadmap': roadmap.to_dict()}), 200


@roadmaps_bp.route('/user/<roadmap_id>', methods=['PUT'])
@jwt_required()
def update_user_roadmap(roadmap_id):
    """Update a user's roadmap."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    roadmap = UserRoadmap.objects(
        id=safe_object_id(roadmap_id), 
        user_id=safe_object_id(user_id)
    ).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    if 'title' in data:
        roadmap.title = data['title']
    if 'description' in data:
        roadmap.description = data['description']
    if 'nodes' in data:
        roadmap.nodes = data['nodes']
    if 'connections' in data:
        roadmap.connections = data['connections']
    if 'completed_nodes' in data:
        roadmap.completed_nodes = data['completed_nodes']
    
    try:
        roadmap.save()
        return jsonify({
            'message': 'Roadmap updated successfully',
            'roadmap': roadmap.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500


@roadmaps_bp.route('/user/<roadmap_id>', methods=['DELETE'])
@jwt_required()
def delete_user_roadmap(roadmap_id):
    """Delete a user's roadmap."""
    user_id = get_jwt_identity()
    
    roadmap = UserRoadmap.objects(
        id=safe_object_id(roadmap_id), 
        user_id=safe_object_id(user_id)
    ).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    try:
        roadmap.delete()
        return jsonify({'message': 'Roadmap deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Delete failed', 'details': str(e)}), 500


@roadmaps_bp.route('/user/<roadmap_id>/progress', methods=['POST'])
@jwt_required()
def update_node_progress(roadmap_id):
    """Mark a node as complete/incomplete."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    node_id = data.get('node_id')
    completed = data.get('completed', True)
    
    if not node_id:
        return jsonify({'error': 'node_id is required'}), 400
    
    roadmap = UserRoadmap.objects(
        id=safe_object_id(roadmap_id), 
        user_id=safe_object_id(user_id)
    ).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    completed_nodes = roadmap.completed_nodes or []
    
    if completed and node_id not in completed_nodes:
        completed_nodes.append(node_id)
    elif not completed and node_id in completed_nodes:
        completed_nodes.remove(node_id)
    
    roadmap.completed_nodes = completed_nodes
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    if not progress:
        progress = UserProgress(user_id=safe_object_id(user_id))
        progress.save()
    
    if completed:
        progress.total_nodes_completed += 1
        progress.update_streak()
        progress.add_activity('node_completed', f'Completed: {node_id}', {'roadmap_id': roadmap_id})
    elif not completed and progress.total_nodes_completed > 0:
        progress.total_nodes_completed -= 1
        progress.save()
    
    try:
        roadmap.save()
        return jsonify({
            'message': 'Progress updated',
            'completed_nodes': completed_nodes,
            'progress': roadmap.get_progress_percentage()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500
