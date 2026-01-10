"""
Quiz Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.quiz import QuizResult
from ..models.progress import UserProgress

quiz_bp = Blueprint('quiz', __name__)

# Sample quiz questions (in production, these would be in the database)
QUIZ_QUESTIONS = {
    'frontend': [
        {
            'id': 1,
            'question': 'What does HTML stand for?',
            'options': [
                'Hyper Text Markup Language',
                'High Tech Modern Language',
                'Hyper Transfer Markup Language',
                'Home Tool Markup Language'
            ],
            'correct': 0,
            'skill': 'HTML'
        },
        {
            'id': 2,
            'question': 'Which CSS property is used to change text color?',
            'options': ['font-color', 'text-color', 'color', 'foreground-color'],
            'correct': 2,
            'skill': 'CSS'
        },
        {
            'id': 3,
            'question': 'What is the correct way to declare a JavaScript variable?',
            'options': ['variable x = 5', 'v x = 5', 'let x = 5', 'var: x = 5'],
            'correct': 2,
            'skill': 'JavaScript'
        },
        {
            'id': 4,
            'question': 'Which command initializes a new Git repository?',
            'options': ['git start', 'git init', 'git create', 'git new'],
            'correct': 1,
            'skill': 'Git'
        },
        {
            'id': 5,
            'question': 'What is React primarily used for?',
            'options': [
                'Database management',
                'Building user interfaces',
                'Server-side scripting',
                'Mobile app development only'
            ],
            'correct': 1,
            'skill': 'React'
        },
        {
            'id': 6,
            'question': 'Which hook is used to manage state in React functional components?',
            'options': ['useEffect', 'useState', 'useContext', 'useReducer'],
            'correct': 1,
            'skill': 'React'
        },
        {
            'id': 7,
            'question': 'What does CSS Flexbox primarily help with?',
            'options': [
                'Adding animations',
                'Layout and alignment',
                'Adding colors',
                'Form validation'
            ],
            'correct': 1,
            'skill': 'CSS'
        },
        {
            'id': 8,
            'question': 'Which method is used to fetch data from an API in JavaScript?',
            'options': ['getData()', 'fetch()', 'request()', 'api()'],
            'correct': 1,
            'skill': 'JavaScript'
        },
        {
            'id': 9,
            'question': 'What is npm?',
            'options': [
                'Node Package Manager',
                'New Programming Method',
                'Network Protocol Manager',
                'Node Process Monitor'
            ],
            'correct': 0,
            'skill': 'Tools'
        },
        {
            'id': 10,
            'question': 'Which HTML tag is used for the largest heading?',
            'options': ['<heading>', '<h6>', '<h1>', '<head>'],
            'correct': 2,
            'skill': 'HTML'
        }
    ],
    'backend': [
        {
            'id': 1,
            'question': 'What does REST stand for?',
            'options': [
                'Representational State Transfer',
                'Remote Execution Service Technology',
                'Request State Transfer',
                'Remote State Technology'
            ],
            'correct': 0,
            'skill': 'APIs'
        },
        {
            'id': 2,
            'question': 'Which HTTP method is used to create a new resource?',
            'options': ['GET', 'POST', 'PUT', 'DELETE'],
            'correct': 1,
            'skill': 'APIs'
        },
        {
            'id': 3,
            'question': 'What is SQL used for?',
            'options': [
                'Styling web pages',
                'Managing databases',
                'Building APIs',
                'Running servers'
            ],
            'correct': 1,
            'skill': 'Databases'
        },
        {
            'id': 4,
            'question': 'Which of these is a NoSQL database?',
            'options': ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
            'correct': 2,
            'skill': 'Databases'
        },
        {
            'id': 5,
            'question': 'What does JWT stand for?',
            'options': [
                'JavaScript Web Token',
                'JSON Web Token',
                'Java Web Transfer',
                'JSON Web Transfer'
            ],
            'correct': 1,
            'skill': 'Authentication'
        }
    ]
}


@quiz_bp.route('/questions', methods=['GET'])
def get_questions():
    """Get quiz questions by category"""
    category = request.args.get('category', 'frontend')
    
    questions = QUIZ_QUESTIONS.get(category, QUIZ_QUESTIONS['frontend'])
    
    # Remove correct answers from response
    safe_questions = []
    for q in questions:
        safe_q = {k: v for k, v in q.items() if k != 'correct'}
        safe_questions.append(safe_q)
    
    return jsonify({
        'category': category,
        'questions': safe_questions,
        'total': len(safe_questions)
    }), 200


@quiz_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    """Submit quiz answers and get results"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    category = data.get('category', 'frontend')
    answers = data.get('answers', [])  # [{question_id, answer}]
    time_taken = data.get('time_taken_seconds')
    
    if not answers:
        return jsonify({'error': 'Answers are required'}), 400
    
    questions = QUIZ_QUESTIONS.get(category, [])
    
    # Calculate results
    score = 0
    strong_skills = set()
    weak_skills = set()
    detailed_answers = []
    
    for answer in answers:
        q_id = answer.get('question_id')
        user_answer = answer.get('answer')
        
        question = next((q for q in questions if q['id'] == q_id), None)
        if question:
            is_correct = user_answer == question['correct']
            
            if is_correct:
                score += 1
                strong_skills.add(question['skill'])
            else:
                weak_skills.add(question['skill'])
            
            detailed_answers.append({
                'question_id': q_id,
                'user_answer': user_answer,
                'correct_answer': question['correct'],
                'is_correct': is_correct,
                'skill': question['skill']
            })
    
    # Remove skills that are in both (conflicting)
    final_strong = list(strong_skills - weak_skills)
    final_weak = list(weak_skills - strong_skills)
    skill_gaps = list(weak_skills)
    
    # Generate recommendations
    recommendations = []
    for skill in skill_gaps:
        recommendations.append(f'Practice more {skill} fundamentals')
    
    try:
        # Save quiz result
        result = QuizResult(
            user_id=user_id,
            category=category,
            answers=detailed_answers,
            score=score,
            total_questions=len(questions),
            strong_skills=final_strong,
            weak_skills=final_weak,
            skill_gaps=skill_gaps,
            recommendations=recommendations,
            time_taken_seconds=time_taken
        )
        result.calculate_percentage()
        
        db.session.add(result)
        
        # Update user progress
        progress = UserProgress.query.filter_by(user_id=user_id).first()
        if progress:
            progress.total_quizzes_taken += 1
            progress.add_activity(
                'quiz_completed', 
                f'{category.title()} Quiz: {result.percentage}%',
                {'category': category, 'score': score}
            )
            
            # Add strong skills
            for skill in final_strong:
                progress.add_skill(skill)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Quiz submitted successfully',
            'result': result.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save results', 'details': str(e)}), 500


@quiz_bp.route('/results', methods=['GET'])
@jwt_required()
def get_quiz_results():
    """Get user's quiz history"""
    user_id = get_jwt_identity()
    
    results = QuizResult.query.filter_by(user_id=user_id)\
        .order_by(QuizResult.created_at.desc()).all()
    
    return jsonify({
        'results': [r.to_dict() for r in results],
        'total': len(results)
    }), 200


@quiz_bp.route('/results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_quiz_result(result_id):
    """Get a specific quiz result"""
    user_id = get_jwt_identity()
    
    result = QuizResult.query.filter_by(
        id=result_id, 
        user_id=user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found'}), 404
    
    return jsonify({'result': result.to_dict()}), 200
