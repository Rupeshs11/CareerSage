"""AI Routes - Roadmap Generation and Chat"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.roadmap import UserRoadmap
from ..models.progress import UserProgress
from ..services.ai_service import ai_service

ai_bp = Blueprint('ai', __name__)

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


def generate_mock_roadmap(topic, skills, experience_level, career_goal):
    """Generate a mock roadmap when AI generation is unavailable."""
    
    from ..data.mock_roadmaps import MOCK_ROADMAPS
    
    roadmap_templates = MOCK_ROADMAPS
    
    template_key = 'frontend-developer'
    
    topic_lower = topic.lower()
    
    if 'cyber' in topic_lower or 'security' in topic_lower or 'hacking' in topic_lower or 'penetration' in topic_lower:
        template_key = 'cyber-security'
    elif 'game' in topic_lower or 'unity' in topic_lower or 'unreal' in topic_lower or 'graphics' in topic_lower:
        template_key = 'game-developer'
    elif 'flutter' in topic_lower or 'react native' in topic_lower or 'mobile' in topic_lower or 'android' in topic_lower or 'ios' in topic_lower or 'app dev' in topic_lower or 'xamarin' in topic_lower:
        if 'flutter' in topic_lower:
            template_key = 'flutter-developer'
        else:
            template_key = 'mobile-developer'
    elif 'embedded' in topic_lower or 'iot' in topic_lower or 'firmware' in topic_lower or 'microcontroller' in topic_lower or 'arduino' in topic_lower or 'raspberry' in topic_lower or 'robotics' in topic_lower:
        template_key = 'embedded-systems'
    elif 'frontend' in topic_lower or 'react' in topic_lower or 'vue' in topic_lower or 'css' in topic_lower or 'angular' in topic_lower or 'web dev' in topic_lower:
        if 'react' in topic_lower or 'next' in topic_lower:
            template_key = 'react-developer'
        else:
            template_key = 'frontend-developer'
    elif 'backend' in topic_lower or 'node' in topic_lower or 'django' in topic_lower or 'api' in topic_lower or 'flask' in topic_lower or 'spring' in topic_lower:
        template_key = 'backend-developer'
    elif 'full' in topic_lower and 'stack' in topic_lower:
        template_key = 'fullstack-developer'
    elif 'data' in topic_lower or 'machine learning' in topic_lower or 'ml' in topic_lower or 'ai' in topic_lower or 'deep learning' in topic_lower:
        template_key = 'data-scientist'
    elif 'cloud' in topic_lower or 'aws' in topic_lower or 'azure' in topic_lower or 'gcp' in topic_lower:
        template_key = 'cloud-engineer'
    elif 'linux' in topic_lower or 'sysadmin' in topic_lower or 'system admin' in topic_lower or 'bash' in topic_lower:
        template_key = 'linux-admin'
    elif 'devops' in topic_lower or 'docker' in topic_lower or 'kubernetes' in topic_lower or 'terraform' in topic_lower or 'ansible' in topic_lower or 'jenkins' in topic_lower:
        template_key = 'devops-engineer'
        
    if career_goal in roadmap_templates:
        template_key = career_goal
        
    template = roadmap_templates.get(template_key, roadmap_templates['frontend-developer'])
    
    import copy
    roadmap = copy.deepcopy(template)
    
    if topic:
        roadmap['title'] = f'{topic.title()} - Complete Path'
        roadmap['description'] = f'Comprehensive learning path for {topic} covering all key concepts.'

    return roadmap



@ai_bp.route('/generate-roadmap', methods=['POST'])
@jwt_required()
def generate_roadmap():
    """Generate AI-powered learning roadmap."""
    current_app.logger.info("Roadmap generation request received")
    
    user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        skills = data.get('skills', [])
        experience_level = data.get('experienceLevel', 'beginner')
        career_goal = data.get('careerGoal', 'frontend-developer')
        
        current_app.logger.info(f"Topic: {topic}, Skills: {skills}, Level: {experience_level}")
    except Exception as e:
        current_app.logger.error(f"Error parsing request JSON: {e}")
        return jsonify({'error': 'Invalid JSON data', 'details': str(e)}), 400
    
    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
    
    try:
        current_app.logger.info(f"Starting roadmap generation for: {topic}")
        
        roadmap_data = ai_service.generate_roadmap(
            topic=topic,
            skills=skills,
            experience_level=experience_level,
            career_goal=career_goal
        )
        
        if isinstance(roadmap_data, dict) and roadmap_data.get('error') == 'non_tech_topic':
            return jsonify({
                'error': 'Invalid topic',
                'message': roadmap_data.get('message', 'Please enter a technology-related topic.')
            }), 400
        
        if roadmap_data is None:
            current_app.logger.warning("AI generation failed, using fallback")
            roadmap_data = generate_mock_roadmap(
                topic=topic,
                skills=skills,
                experience_level=experience_level,
                career_goal=career_goal
            )
        
        current_app.logger.info(f"Roadmap generated: {roadmap_data.get('title')}")
        

        user_roadmap = UserRoadmap(
            user_id=safe_object_id(user_id),
            title=roadmap_data['title'],
            description=roadmap_data['description'],
            nodes=roadmap_data['nodes'],
            connections=roadmap_data['connections'],
            is_ai_generated=True,
            generation_params={
                'topic': topic,
                'skills': skills,
                'experience_level': experience_level,
                'career_goal': career_goal
            }
        )
        
        user_roadmap.save()
        
        progress = UserProgress.objects(user_id=safe_object_id(user_id)).first()
        if progress:
            progress.total_roadmaps_started += 1
            progress.add_activity(
                'ai_roadmap_generated', 
                f'Generated: {roadmap_data["title"]}',
                {'topic': topic, 'career_goal': career_goal}
            )
        
        return jsonify({
            'message': 'Roadmap generated successfully',
            'roadmap': user_roadmap.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Generation failed', 'details': str(e)}), 500


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    """Chat with AI tutor."""
    data = request.get_json()
    
    message = data.get('message', '')
    context = data.get('context', {})
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    mock_responses = {
        'default': "I'm your AI learning assistant! I can help you with questions about your learning path, explain concepts, or suggest resources. What would you like to know?",
        'help': "I can help you with:\n1. Explaining technical concepts\n2. Suggesting learning resources\n3. Answering coding questions\n4. Providing career guidance",
        'roadmap': "Based on your current progress, I recommend focusing on the fundamentals first. Master the basics before moving to advanced topics!",
    }
    
    response = mock_responses['default']
    if 'help' in message.lower():
        response = mock_responses['help']
    elif 'roadmap' in message.lower() or 'next' in message.lower():
        response = mock_responses['roadmap']
    
    return jsonify({
        'response': response,
        'context': context
    }), 200


@ai_bp.route('/suggest-resources', methods=['POST'])
@jwt_required()
def suggest_resources():
    """Get AI-suggested learning resources."""
    data = request.get_json()
    
    topic = data.get('topic', '')
    skill_level = data.get('skill_level', 'beginner')
    
    resources = {
        'html': [
            {'title': 'MDN HTML Guide', 'url': 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'type': 'documentation'},
            {'title': 'freeCodeCamp HTML', 'url': 'https://www.freecodecamp.org/learn/responsive-web-design/', 'type': 'course'},
        ],
        'css': [
            {'title': 'CSS-Tricks', 'url': 'https://css-tricks.com/', 'type': 'blog'},
            {'title': 'Flexbox Froggy', 'url': 'https://flexboxfroggy.com/', 'type': 'interactive'},
        ],
        'javascript': [
            {'title': 'JavaScript.info', 'url': 'https://javascript.info/', 'type': 'tutorial'},
            {'title': 'Eloquent JavaScript', 'url': 'https://eloquentjavascript.net/', 'type': 'book'},
        ],
        'react': [
            {'title': 'React Official Docs', 'url': 'https://react.dev/', 'type': 'documentation'},
            {'title': 'React Tutorial', 'url': 'https://react.dev/learn', 'type': 'tutorial'},
        ],
        'default': [
            {'title': 'freeCodeCamp', 'url': 'https://www.freecodecamp.org/', 'type': 'course'},
            {'title': 'Codecademy', 'url': 'https://www.codecademy.com/', 'type': 'course'},
        ]
    }
    
    topic_resources = resources.get(topic.lower(), resources['default'])
    
    return jsonify({
        'topic': topic,
        'resources': topic_resources
    }), 200
