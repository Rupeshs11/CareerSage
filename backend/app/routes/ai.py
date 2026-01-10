"""
AI Routes - Roadmap Generation and Chat
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.roadmap import UserRoadmap
from ..models.progress import UserProgress

ai_bp = Blueprint('ai', __name__)


def generate_mock_roadmap(topic, skills, experience_level, career_goal):
    """
    Generate a mock roadmap based on parameters.
    In production, this would call Ollama/LangChain for actual AI generation.
    """
    
    # Define roadmap templates based on career goals
    roadmap_templates = {
        'frontend-developer': {
            'title': f'Frontend Developer - {experience_level.title()} Path',
            'description': f'Personalized learning path for {topic} focusing on frontend development',
            'nodes': [
                {'id': 'html', 'title': 'HTML Fundamentals', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Semantic HTML', 'Forms', 'Accessibility']},
                {'id': 'css', 'title': 'CSS Styling', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Flexbox', 'Grid', 'Responsive Design']},
                {'id': 'js', 'title': 'JavaScript', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['ES6+', 'DOM', 'Async/Await']},
                {'id': 'framework', 'title': 'Frontend Framework', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['React', 'Vue', 'or Angular']},
                {'id': 'state', 'title': 'State Management', 'x': 300, 'y': 480, 'type': 'recommended', 'topics': ['Redux', 'Zustand', 'Context']},
                {'id': 'testing', 'title': 'Testing', 'x': 700, 'y': 480, 'type': 'recommended', 'topics': ['Jest', 'React Testing Library']},
                {'id': 'build', 'title': 'Build Tools', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Vite', 'Webpack']},
                {'id': 'deploy', 'title': 'Deployment', 'x': 500, 'y': 720, 'type': 'required', 'topics': ['Vercel', 'Netlify', 'AWS']},
            ],
            'connections': [
                {'from': 'html', 'to': 'css'},
                {'from': 'css', 'to': 'js'},
                {'from': 'js', 'to': 'framework'},
                {'from': 'framework', 'to': 'state'},
                {'from': 'framework', 'to': 'testing'},
                {'from': 'state', 'to': 'build'},
                {'from': 'testing', 'to': 'build'},
                {'from': 'build', 'to': 'deploy'},
            ]
        },
        'backend-developer': {
            'title': f'Backend Developer - {experience_level.title()} Path',
            'description': f'Personalized learning path for {topic} focusing on backend development',
            'nodes': [
                {'id': 'language', 'title': 'Programming Language', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Python', 'Node.js', 'or Java']},
                {'id': 'database', 'title': 'Databases', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['PostgreSQL', 'MongoDB']},
                {'id': 'api', 'title': 'API Development', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['REST', 'GraphQL']},
                {'id': 'auth', 'title': 'Authentication', 'x': 300, 'y': 360, 'type': 'required', 'topics': ['JWT', 'OAuth']},
                {'id': 'cache', 'title': 'Caching', 'x': 700, 'y': 360, 'type': 'recommended', 'topics': ['Redis', 'Memcached']},
                {'id': 'docker', 'title': 'Containerization', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['Docker', 'Docker Compose']},
                {'id': 'cloud', 'title': 'Cloud Services', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['AWS', 'GCP', 'Azure']},
            ],
            'connections': [
                {'from': 'language', 'to': 'database'},
                {'from': 'database', 'to': 'api'},
                {'from': 'api', 'to': 'auth'},
                {'from': 'api', 'to': 'cache'},
                {'from': 'auth', 'to': 'docker'},
                {'from': 'cache', 'to': 'docker'},
                {'from': 'docker', 'to': 'cloud'},
            ]
        },
        'fullstack-developer': {
            'title': f'Full Stack Developer - {experience_level.title()} Path',
            'description': f'Personalized learning path for {topic} covering full stack development',
            'nodes': [
                {'id': 'html-css', 'title': 'HTML & CSS', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Semantic HTML', 'CSS3', 'Responsive']},
                {'id': 'js', 'title': 'JavaScript', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['ES6+', 'Async', 'DOM']},
                {'id': 'react', 'title': 'React', 'x': 300, 'y': 240, 'type': 'required', 'topics': ['Components', 'Hooks', 'State']},
                {'id': 'node', 'title': 'Node.js', 'x': 700, 'y': 240, 'type': 'required', 'topics': ['Express', 'NPM', 'APIs']},
                {'id': 'database', 'title': 'Databases', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['PostgreSQL', 'MongoDB']},
                {'id': 'auth', 'title': 'Authentication', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['JWT', 'Sessions']},
                {'id': 'deploy', 'title': 'Deployment', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Docker', 'Vercel', 'AWS']},
            ],
            'connections': [
                {'from': 'html-css', 'to': 'js'},
                {'from': 'js', 'to': 'react'},
                {'from': 'js', 'to': 'node'},
                {'from': 'react', 'to': 'database'},
                {'from': 'node', 'to': 'database'},
                {'from': 'database', 'to': 'auth'},
                {'from': 'auth', 'to': 'deploy'},
            ]
        },
        'data-scientist': {
            'title': f'Data Scientist - {experience_level.title()} Path',
            'description': f'Personalized learning path for {topic} in data science',
            'nodes': [
                {'id': 'python', 'title': 'Python', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Basics', 'NumPy', 'Pandas']},
                {'id': 'stats', 'title': 'Statistics', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Descriptive', 'Inferential', 'Probability']},
                {'id': 'ml', 'title': 'Machine Learning', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Scikit-learn', 'Regression', 'Classification']},
                {'id': 'viz', 'title': 'Data Visualization', 'x': 300, 'y': 360, 'type': 'required', 'topics': ['Matplotlib', 'Seaborn', 'Plotly']},
                {'id': 'dl', 'title': 'Deep Learning', 'x': 700, 'y': 360, 'type': 'recommended', 'topics': ['TensorFlow', 'PyTorch']},
                {'id': 'sql', 'title': 'SQL & Databases', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['SQL', 'PostgreSQL']},
            ],
            'connections': [
                {'from': 'python', 'to': 'stats'},
                {'from': 'stats', 'to': 'ml'},
                {'from': 'ml', 'to': 'viz'},
                {'from': 'ml', 'to': 'dl'},
                {'from': 'viz', 'to': 'sql'},
                {'from': 'dl', 'to': 'sql'},
            ]
        }
    }
    
    # Get template or use default
    template = roadmap_templates.get(career_goal, roadmap_templates['frontend-developer'])
    
    # Adjust based on experience level
    if experience_level == 'beginner':
        # Add foundational nodes
        pass
    elif experience_level == 'advanced':
        # Skip basics, add advanced topics
        pass
    
    return template


@ai_bp.route('/generate-roadmap', methods=['POST'])
@jwt_required()
def generate_roadmap():
    """Generate a personalized roadmap using AI"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    topic = data.get('topic', '')
    skills = data.get('skills', [])
    experience_level = data.get('experience_level', 'beginner')
    career_goal = data.get('career_goal', 'frontend-developer')
    
    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
    
    try:
        # Generate roadmap (mock for now, would use AI in production)
        roadmap_data = generate_mock_roadmap(
            topic=topic,
            skills=skills,
            experience_level=experience_level,
            career_goal=career_goal
        )
        
        # Save to database
        user_roadmap = UserRoadmap(
            user_id=user_id,
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
        
        db.session.add(user_roadmap)
        
        # Update user progress
        progress = UserProgress.query.filter_by(user_id=user_id).first()
        if progress:
            progress.total_roadmaps_started += 1
            progress.add_activity(
                'ai_roadmap_generated', 
                f'Generated: {roadmap_data["title"]}',
                {'topic': topic, 'career_goal': career_goal}
            )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Roadmap generated successfully',
            'roadmap': user_roadmap.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Generation failed', 'details': str(e)}), 500


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    """Chat with AI tutor (mock implementation)"""
    data = request.get_json()
    
    message = data.get('message', '')
    context = data.get('context', {})  # Current roadmap, topic, etc.
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Mock AI response (in production, would call Ollama/OpenAI)
    mock_responses = {
        'default': "I'm your AI learning assistant! I can help you with questions about your learning path, explain concepts, or suggest resources. What would you like to know?",
        'help': "I can help you with:\n1. Explaining technical concepts\n2. Suggesting learning resources\n3. Answering coding questions\n4. Providing career guidance",
        'roadmap': "Based on your current progress, I recommend focusing on the fundamentals first. Master the basics before moving to advanced topics!",
    }
    
    # Simple keyword matching (would be AI in production)
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
    """Get AI-suggested learning resources"""
    data = request.get_json()
    
    topic = data.get('topic', '')
    skill_level = data.get('skill_level', 'beginner')
    
    # Mock resources (in production, would be AI-curated)
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
