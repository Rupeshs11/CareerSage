"""Dashboard Routes"""
from flask import Blueprint, request, jsonify
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
    
    # Derive skills from completed nodes across all roadmaps
    roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id)).all()
    avg_progress = 0
    derived_skills = set()
    if roadmaps:
        total_progress = sum(r.get_progress_percentage() for r in roadmaps)
        avg_progress = round(total_progress / len(roadmaps))
        
        # Extract skills from completed nodes
        for r in roadmaps:
            completed = set(r.completed_nodes or [])
            for node in (r.nodes or []):
                if node.get('id') in completed:
                    derived_skills.add(node.get('title', node.get('id')))
    
    total_quizzes = QuizResult.objects(user_id=safe_object_id(user_id)).count()
    quiz_results = QuizResult.objects(user_id=safe_object_id(user_id)).all()
    avg_quiz_score = 0
    if quiz_results:
        total_score = sum(r.percentage for r in quiz_results)
        avg_quiz_score = round(total_score / len(quiz_results))
    
    return jsonify({
        'stats': {
            'total_progress': avg_progress,
            'active_roadmaps': len(roadmaps) if roadmaps else 0,
            'skills_acquired': len(derived_skills),
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
        .order_by('-updated_at').all()
    
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


@dashboard_bp.route('/weekly-activity', methods=['GET'])
@jwt_required()
def get_weekly_activity():
    """Get user's activity count grouped by day for the last 7 days."""
    user_id = get_jwt_identity()
    
    progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
    
    # Build last 7 days
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    day_labels = []
    day_counts = []
    
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_labels.append(d.strftime('%a'))  # Mon, Tue, etc.
        day_counts.append(0)
    
    if progress and progress.recent_activity:
        for activity in progress.recent_activity:
            ts = activity.get('timestamp')
            if ts:
                try:
                    activity_date = datetime.fromisoformat(ts).date()
                    diff = (today - activity_date).days
                    if 0 <= diff <= 6:
                        idx = 6 - diff
                        day_counts[idx] += 1
                except (ValueError, TypeError):
                    pass
    
    return jsonify({
        'labels': day_labels,
        'counts': day_counts,
        'max_count': max(day_counts) if day_counts else 0
    }), 200


@dashboard_bp.route('/skills', methods=['GET'])
@jwt_required()
def get_user_skills():
    """Get user's acquired skills derived from completed roadmap nodes."""
    user_id = get_jwt_identity()
    
    roadmaps = UserRoadmap.objects(user_id=safe_object_id(user_id)).all()
    
    derived_skills = []
    seen = set()
    for r in roadmaps:
        completed = set(r.completed_nodes or [])
        for node in (r.nodes or []):
            if node.get('id') in completed:
                skill_name = node.get('title', node.get('id'))
                if skill_name not in seen:
                    seen.add(skill_name)
                    derived_skills.append(skill_name)
    
    return jsonify({'skills': derived_skills}), 200


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


@dashboard_bp.route('/test-results', methods=['POST'])
@jwt_required()
def save_test_result():
    """Save an AI skill-test result."""
    user_id = get_jwt_identity()
    data = request.get_json()

    skill = data.get('skill', 'General')
    score = data.get('score', 0)
    total = data.get('total', 0)
    percentage = data.get('percentage', 0)
    feedback = data.get('feedback', '')

    try:
        result = QuizResult(
            user_id=safe_object_id(user_id),
            category=skill,
            quiz_type='skill_test',
            score=score,
            total_questions=total,
            percentage=percentage,
            recommendations=[feedback] if feedback else []
        )
        result.save()

        # Update user progress
        progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
        if not progress:
            progress = UserProgress(user_id=safe_object_id(user_id))
            progress.save()

        progress.total_quizzes_taken += 1
        progress.add_activity(
            'skill_test',
            f'Skill Test: {skill} — {percentage}%',
            {'skill': skill, 'score': score, 'total': total}
        )

        return jsonify({
            'message': 'Test result saved',
            'result': result.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': 'Failed to save test result', 'details': str(e)}), 500


@dashboard_bp.route('/test-history', methods=['GET'])
@jwt_required()
def get_test_history():
    """Get user's skill-test history."""
    user_id = get_jwt_identity()

    results = QuizResult.objects(
        user_id=safe_object_id(user_id),
        quiz_type='skill_test'
    ).order_by('-created_at').limit(20).all()

    history = []
    for r in results:
        history.append({
            'id': str(r.id),
            'skill': r.category,
            'score': r.score,
            'total': r.total_questions,
            'percentage': r.percentage,
            'feedback': r.recommendations[0] if r.recommendations else '',
            'date': r.created_at.isoformat() if r.created_at else None
        })

    return jsonify({'history': history}), 200
