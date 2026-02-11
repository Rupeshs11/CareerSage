"""Dashboard Routes"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..models.roadmap import UserRoadmap
from ..models.quiz import QuizResult
from ..models.progress import UserProgress

dashboard_bp = Blueprint('dashboard', __name__)


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


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get user's dashboard statistics."""
    user_id = get_jwt_identity()
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    
    total_roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id)).count()
    
    roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id)).all()
    avg_progress = 0
    if roadmaps:
        total_progress = sum(r.get_progress_percentage() for r in roadmaps)
        avg_progress = round(total_progress / len(roadmaps))
    
    total_quizzes = QuizResult.objects(user_id=safe_object_id(user_id)).count()
    quiz_results = QuizResult.objects(user_id=safe_object_id(user_id)).all()
    avg_quiz_score = 0
    if quiz_results:
        total_score = sum(r.percentage for r in quiz_results)
        avg_quiz_score = round(total_score / len(quiz_results))
    
    skills_count = len(progress.skills) if progress and progress.skills else 0
    
    return jsonify({
        'stats': {
            'total_progress': avg_progress,
            'active_roadmaps': total_roadmaps,
            'skills_acquired': skills_count,
            'quizzes_taken': total_quizzes,
            'avg_quiz_score': avg_quiz_score,
            'current_streak': progress.current_streak if progress else 0,
            'longest_streak': progress.longest_streak if progress else 0,
            'nodes_completed': progress.total_nodes_completed if progress else 0
        }
    }), 200


@dashboard_bp.route('/roadmaps', methods=['GET'])
@jwt_required()
def get_dashboard_roadmaps():
    """Get user's roadmaps for dashboard."""
    user_id = get_jwt_identity()
    
    roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id))\
        .order_by('-updated_at')\
        .limit(5).all()
    
    roadmap_data = []
    for r in roadmaps:
        roadmap_data.append(r.to_dict())
    
    return jsonify({'roadmaps': roadmap_data}), 200


@dashboard_bp.route('/roadmaps/<roadmap_id>', methods=['GET'])
@jwt_required()
def get_single_roadmap(roadmap_id):
    """Get a single user roadmap by ID."""
    user_id = get_jwt_identity()
    
    roadmap = UserRoadmap.objects(id=roadmap_id, user_id=user_id).first()
    
    if not roadmap:
        return jsonify({'error': 'Roadmap not found'}), 404
    
    return jsonify({'roadmap': roadmap.to_dict()}), 200


@dashboard_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Get user's recent activity."""
    user_id = get_jwt_identity()
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    
    if not progress:
        return jsonify({'activity': []}), 200
    
    return jsonify({
        'activity': progress.recent_activity or []
    }), 200


@dashboard_bp.route('/skills', methods=['GET'])
@jwt_required()
def get_user_skills():
    """Get user's acquired skills."""
    user_id = get_jwt_identity()
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    
    skills = []
    if progress and progress.skills:
        skills = progress.skills
    
    return jsonify({'skills': skills}), 200


@dashboard_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_full_progress():
    """Get complete user progress data."""
    user_id = get_jwt_identity()
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    
    if not progress:
        return jsonify({'progress': {
            'total_roadmaps_started': 0,
            'total_roadmaps_completed': 0,
            'total_nodes_completed': 0,
            'total_quizzes_taken': 0,
            'skills': [],
            'current_streak': 0,
            'longest_streak': 0,
            'recent_activity': []
        }}), 200
    
    return jsonify({'progress': progress.to_dict()}), 200


@dashboard_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top users by progress."""
    # Get top 10 users by nodes completed
    top_progress = UserProgress.objects\
        .order_by('-total_nodes_completed')\
        .limit(10).all()
    
    leaderboard = []
    for i, progress in enumerate(top_progress):
        user = User.objects(id=progress.user_id.id).first()
        if user:
            leaderboard.append({
                'rank': i + 1,
                'name': user.name,
                'nodes_completed': progress.total_nodes_completed,
                'streak': progress.current_streak
            })
    
    return jsonify({'leaderboard': leaderboard}), 200
