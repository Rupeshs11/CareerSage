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
        mode = data.get('mode', 'beginner')
        
        current_app.logger.info(f"Topic: {topic}, Skills: {skills}, Level: {experience_level}")
    except Exception as e:
        current_app.logger.error(f"Error parsing request JSON: {e}")
        return jsonify({'error': 'Invalid JSON data', 'details': str(e)}), 400
    
    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
    
    # Validate topic - reject gibberish but allow valid symbols (#, ., +)
    import re
    topic_clean = topic.strip()
    # Strip non-alphabetical chars for gibberish detection only
    alpha_only = re.sub(r'[^a-zA-Z]', '', topic_clean)
    if len(alpha_only) < 1:
        return jsonify({'error': 'Please enter a valid learning topic'}), 400
    vowels = len(re.findall(r'[aeiouAEIOU]', alpha_only))
    # Only check vowel ratio for longer inputs (short ones like "C#" or "R" are valid)
    if len(alpha_only) > 3 and (vowels / len(alpha_only)) < 0.1:
        return jsonify({'error': 'That doesn\'t look like a valid topic. Try something like "Frontend Development" or "Machine Learning".'}), 400
    if len(alpha_only) > 6 and re.search(r'[^aeiou]{7,}', alpha_only, re.IGNORECASE):
        return jsonify({'error': 'That doesn\'t look like a valid topic. Try something like "Frontend Development" or "Machine Learning".'}), 400
    
    try:
        current_app.logger.info(f"Starting roadmap generation for: {topic}")
        
        roadmap_data = ai_service.generate_roadmap(
            topic=topic,
            skills=skills,
            experience_level=experience_level,
            career_goal=career_goal,
            mode=mode
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
        
        # Auto-mark nodes matching user's existing skills as completed
        auto_completed = []
        if skills:
            skill_words = [s.lower().strip() for s in skills]
            current_app.logger.info(f"Matching skills {skill_words} against {len(roadmap_data.get('nodes', []))} nodes")
            
            for node in roadmap_data.get('nodes', []):
                node_title = node.get('title', '').lower()
                node_id = node.get('id', '').lower()
                node_desc = node.get('description', '').lower()
                node_topics = [t.lower() for t in node.get('topics', [])]
                
                # Build a single searchable string from all node text
                search_text = f"{node_id} {node_title} {node_desc} {' '.join(node_topics)}"
                
                for skill in skill_words:
                    if skill in search_text:
                        auto_completed.append(node.get('id'))
                        current_app.logger.info(f"  Skill '{skill}' matched node '{node.get('id')}' ({node_title})")
                        break
            
            current_app.logger.info(f"Auto-completed {len(auto_completed)} nodes: {auto_completed}")

        user_roadmap = UserRoadmap(
            user_id=safe_object_id(user_id),
            title=roadmap_data['title'],
            description=roadmap_data['description'],
            nodes=roadmap_data['nodes'],
            connections=roadmap_data['connections'],
            is_ai_generated=True,
            completed_nodes=auto_completed,
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
            {'title': 'HTML Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=kUMe1FH4CHE', 'type': 'video'},
            {'title': 'MDN HTML Guide', 'url': 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'type': 'documentation'},
            {'title': 'freeCodeCamp HTML', 'url': 'https://www.freecodecamp.org/learn/responsive-web-design/', 'type': 'course'},
        ],
        'css': [
            {'title': 'CSS Tutorial - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', 'type': 'video'},
            {'title': 'CSS-Tricks', 'url': 'https://css-tricks.com/', 'type': 'blog'},
            {'title': 'Flexbox Froggy', 'url': 'https://flexboxfroggy.com/', 'type': 'interactive'},
        ],
        'javascript': [
            {'title': 'JavaScript Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=PkZNo7MFNFg', 'type': 'video'},
            {'title': 'Namaste JavaScript - Akshay Saini', 'url': 'https://www.youtube.com/watch?v=pN6jk0uUrfo', 'type': 'video'},
            {'title': 'JavaScript.info', 'url': 'https://javascript.info/', 'type': 'tutorial'},
            {'title': 'Eloquent JavaScript', 'url': 'https://eloquentjavascript.net/', 'type': 'book'},
        ],
        'typescript': [
            {'title': 'TypeScript for Beginners - Traversy Media', 'url': 'https://www.youtube.com/watch?v=BCg4U1FzODs', 'type': 'video'},
            {'title': 'TypeScript Handbook', 'url': 'https://www.typescriptlang.org/docs/handbook/', 'type': 'documentation'},
        ],
        'react': [
            {'title': 'React Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=bMknfKXIFA8', 'type': 'video'},
            {'title': 'React in 100 Seconds - Fireship', 'url': 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 'type': 'video'},
            {'title': 'React Official Docs', 'url': 'https://react.dev/', 'type': 'documentation'},
        ],
        'angular': [
            {'title': 'Angular Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=3qBXWUpoPHo', 'type': 'video'},
            {'title': 'Angular Official Docs', 'url': 'https://angular.io/docs', 'type': 'documentation'},
        ],
        'vue': [
            {'title': 'Vue.js Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=FXpIoQ_rT_c', 'type': 'video'},
            {'title': 'Vue.js Official Guide', 'url': 'https://vuejs.org/guide/', 'type': 'documentation'},
        ],
        'node': [
            {'title': 'Node.js Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=Oe421EPjeBE', 'type': 'video'},
            {'title': 'Node.js Crash Course - Traversy Media', 'url': 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', 'type': 'video'},
            {'title': 'Node.js Documentation', 'url': 'https://nodejs.org/en/docs/', 'type': 'documentation'},
        ],
        'express': [
            {'title': 'Express.js Crash Course - Traversy Media', 'url': 'https://www.youtube.com/watch?v=L72fhGm1tfE', 'type': 'video'},
            {'title': 'Express.js Docs', 'url': 'https://expressjs.com/', 'type': 'documentation'},
        ],
        'python': [
            {'title': 'Python Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=rfscVS0vtbw', 'type': 'video'},
            {'title': 'Python Tutorial - Code With Harry (Hindi)', 'url': 'https://www.youtube.com/watch?v=7wnove7K-ZQ', 'type': 'video'},
            {'title': 'Python Official Docs', 'url': 'https://docs.python.org/3/', 'type': 'documentation'},
        ],
        'django': [
            {'title': 'Django Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=F5mRW0jo-U4', 'type': 'video'},
            {'title': 'Django Official Tutorial', 'url': 'https://docs.djangoproject.com/en/stable/intro/tutorial01/', 'type': 'documentation'},
        ],
        'flask': [
            {'title': 'Flask Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=Z1RJmh_OqeA', 'type': 'video'},
            {'title': 'Flask Official Docs', 'url': 'https://flask.palletsprojects.com/', 'type': 'documentation'},
        ],
        'java': [
            {'title': 'Java Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=grEKMHGYyns', 'type': 'video'},
            {'title': 'Java Tutorial - Apna College', 'url': 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', 'type': 'video'},
            {'title': 'Java Documentation', 'url': 'https://docs.oracle.com/javase/tutorial/', 'type': 'documentation'},
        ],
        'spring': [
            {'title': 'Spring Boot Tutorial - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=9SGDpanrc8U', 'type': 'video'},
            {'title': 'Spring Official Guides', 'url': 'https://spring.io/guides', 'type': 'documentation'},
        ],
        'c#': [
            {'title': 'C# Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=GhQdlMFjVpI', 'type': 'video'},
            {'title': 'C# Tutorial - Code With Harry (Hindi)', 'url': 'https://www.youtube.com/watch?v=SuLiu5AK9Ps', 'type': 'video'},
            {'title': 'C# Documentation', 'url': 'https://learn.microsoft.com/en-us/dotnet/csharp/', 'type': 'documentation'},
        ],
        '.net': [
            {'title': '.NET Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=hZ1DASYd9rk', 'type': 'video'},
            {'title': '.NET Documentation', 'url': 'https://learn.microsoft.com/en-us/dotnet/', 'type': 'documentation'},
        ],
        'c++': [
            {'title': 'C++ Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 'type': 'video'},
            {'title': 'C++ Tutorial - Apna College', 'url': 'https://www.youtube.com/watch?v=z9bZufPHFLU', 'type': 'video'},
            {'title': 'C++ Reference', 'url': 'https://cppreference.com/', 'type': 'documentation'},
        ],
        'rust': [
            {'title': 'Rust Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=BpPEoZW5IiY', 'type': 'video'},
            {'title': 'The Rust Book', 'url': 'https://doc.rust-lang.org/book/', 'type': 'documentation'},
        ],
        'go': [
            {'title': 'Go Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=un6ZyFkqFKo', 'type': 'video'},
            {'title': 'Go by Example', 'url': 'https://gobyexample.com/', 'type': 'documentation'},
        ],
        'kotlin': [
            {'title': 'Kotlin Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=F9UC9DY-vIU', 'type': 'video'},
            {'title': 'Kotlin Official Docs', 'url': 'https://kotlinlang.org/docs/', 'type': 'documentation'},
        ],
        'swift': [
            {'title': 'Swift Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=comQ1-x2a1Q', 'type': 'video'},
            {'title': 'Swift Documentation', 'url': 'https://developer.apple.com/swift/', 'type': 'documentation'},
        ],
        'flutter': [
            {'title': 'Flutter Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=VPvVD8t02U8', 'type': 'video'},
            {'title': 'Flutter Official Docs', 'url': 'https://docs.flutter.dev/', 'type': 'documentation'},
        ],
        'docker': [
            {'title': 'Docker Full Course - TechWorld with Nana', 'url': 'https://www.youtube.com/watch?v=3c-iBn73dDE', 'type': 'video'},
            {'title': 'Docker Crash Course - Traversy Media', 'url': 'https://www.youtube.com/watch?v=pTFZFxd4hOI', 'type': 'video'},
            {'title': 'Docker Documentation', 'url': 'https://docs.docker.com/', 'type': 'documentation'},
        ],
        'kubernetes': [
            {'title': 'Kubernetes Course - TechWorld with Nana', 'url': 'https://www.youtube.com/watch?v=X48VuDVv0do', 'type': 'video'},
            {'title': 'Kubernetes Official Docs', 'url': 'https://kubernetes.io/docs/', 'type': 'documentation'},
        ],
        'devops': [
            {'title': 'DevOps Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=j5Zsa_eOXeY', 'type': 'video'},
            {'title': 'DevOps Roadmap - TechWorld with Nana', 'url': 'https://www.youtube.com/watch?v=9pZ2xmsSDdo', 'type': 'video'},
        ],
        'aws': [
            {'title': 'AWS Certified Cloud Practitioner - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=SOTamWNgDKc', 'type': 'video'},
            {'title': 'AWS Documentation', 'url': 'https://docs.aws.amazon.com/', 'type': 'documentation'},
        ],
        'mongodb': [
            {'title': 'MongoDB Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=ofme2o29ngU', 'type': 'video'},
            {'title': 'MongoDB Documentation', 'url': 'https://www.mongodb.com/docs/', 'type': 'documentation'},
        ],
        'sql': [
            {'title': 'SQL Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 'type': 'video'},
            {'title': 'SQL Tutorial - Apna College', 'url': 'https://www.youtube.com/watch?v=hlGoQC332VM', 'type': 'video'},
        ],
        'git': [
            {'title': 'Git & GitHub Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=RGOj5yH7evk', 'type': 'video'},
            {'title': 'Git Documentation', 'url': 'https://git-scm.com/doc', 'type': 'documentation'},
        ],
        'linux': [
            {'title': 'Linux Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=sWbUDq4S6Y8', 'type': 'video'},
            {'title': 'Linux Command Line - Traversy Media', 'url': 'https://www.youtube.com/watch?v=cBokz0LTizk', 'type': 'video'},
        ],
        'machine learning': [
            {'title': 'Machine Learning Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=NWONeJKn6kc', 'type': 'video'},
            {'title': 'ML Course - Code With Harry (Hindi)', 'url': 'https://www.youtube.com/watch?v=7uwa9aPbBRU', 'type': 'video'},
        ],
        'data science': [
            {'title': 'Data Science Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=ua-CiDNNj30', 'type': 'video'},
        ],
        'autocad': [
            {'title': 'AutoCAD Full Course for Beginners', 'url': 'https://www.youtube.com/watch?v=VtLXsKBgUXo', 'type': 'video'},
            {'title': 'AutoCAD Documentation', 'url': 'https://help.autodesk.com/view/ACD/2024/ENU/', 'type': 'documentation'},
        ],
        'solidworks': [
            {'title': 'SolidWorks Full Tutorial', 'url': 'https://www.youtube.com/watch?v=qtgmGkEPXs0', 'type': 'video'},
        ],
        'matlab': [
            {'title': 'MATLAB Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=7f50sQYjNRA', 'type': 'video'},
            {'title': 'MATLAB Documentation', 'url': 'https://www.mathworks.com/help/matlab/', 'type': 'documentation'},
        ],
        'blender': [
            {'title': 'Blender Beginner Tutorial - Blender Guru', 'url': 'https://www.youtube.com/watch?v=nIoXOplUvAw', 'type': 'video'},
        ],
        'cyber security': [
            {'title': 'Cybersecurity Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=U_P23SqJaDc', 'type': 'video'},
        ],
        'blockchain': [
            {'title': 'Blockchain Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=gyMwXuJrbJQ', 'type': 'video'},
        ],
        'tailwind': [
            {'title': 'Tailwind CSS Course - Traversy Media', 'url': 'https://www.youtube.com/watch?v=dFgzHOX84xQ', 'type': 'video'},
            {'title': 'Tailwind CSS Docs', 'url': 'https://tailwindcss.com/docs', 'type': 'documentation'},
        ],
        'next': [
            {'title': 'Next.js Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=mTz0GXj8NN0', 'type': 'video'},
            {'title': 'Next.js Official Docs', 'url': 'https://nextjs.org/docs', 'type': 'documentation'},
        ],
        'php': [
            {'title': 'PHP Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=OK_JCtrrv-c', 'type': 'video'},
            {'title': 'PHP Documentation', 'url': 'https://www.php.net/docs.php', 'type': 'documentation'},
        ],
        'ruby': [
            {'title': 'Ruby Full Course - freeCodeCamp', 'url': 'https://www.youtube.com/watch?v=t_ispmWmdjY', 'type': 'video'},
        ],
    }
    
    # Smart matching: check if any key is contained in the topic
    topic_lower = topic.lower().strip()
    topic_resources = resources.get(topic_lower)
    
    if not topic_resources:
        # Try partial matching - e.g. "Node.js" matches "node", "React Native" matches "react"
        for key in resources:
            if key in topic_lower or topic_lower in key:
                topic_resources = resources[key]
                break
    
    if not topic_resources:
        # Build a YouTube search URL as smart fallback
        import re
        safe_query = re.sub(r'[^a-zA-Z0-9 ]', '', topic).replace(' ', '+')
        topic_resources = [
            {'title': f'{topic} - Full Tutorial (YouTube)', 'url': f'https://www.youtube.com/results?search_query={safe_query}+full+course+tutorial', 'type': 'video'},
            {'title': f'freeCodeCamp', 'url': 'https://www.freecodecamp.org/', 'type': 'course'},
            {'title': f'Search Google for {topic}', 'url': f'https://www.google.com/search?q={safe_query}+tutorial', 'type': 'article'},
        ]
    
    return jsonify({
        'topic': topic,
        'resources': topic_resources
    }), 200


@ai_bp.route('/search-resources', methods=['POST'])
@jwt_required()
def search_resources_web():
    data = request.get_json()
    skill = data.get('skill', '')
    
    if not skill:
        return jsonify({'error': 'Skill is required'}), 400
    
    try:
        from ..services.search_service import search_service
        results = search_service.search_resources(skill)
        return jsonify({
            'skill': skill,
            'resources': results
        }), 200
    except Exception as e:
        current_app.logger.error(f"Search failed: {e}")
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500


@ai_bp.route('/generate-skill-test', methods=['POST'])
@jwt_required()
def generate_skill_test():
    data = request.get_json()
    skill = data.get('skill', '')
    topics = data.get('topics', [])
    
    if not skill:
        return jsonify({'error': 'Skill is required'}), 400
    
    try:
        test_data = ai_service.generate_skill_test(skill, topics)
        
        if test_data is None:
            return jsonify({'error': 'Failed to generate test. Please try again.'}), 500
        
        return jsonify(test_data), 200
    except Exception as e:
        current_app.logger.error(f"Skill test generation failed: {e}")
        return jsonify({'error': 'Test generation failed', 'details': str(e)}), 500
