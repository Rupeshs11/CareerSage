"""Battle Routes - REST + Socket.IO events for 1v1 Skill Battles"""
import random
import json
import re
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
from ..extensions import db, socketio
from ..models.battle import BattleResult, BattleStats
from ..models.user import User
from ..models.progress import UserProgress
from bson import ObjectId
from bson.errors import InvalidId

battle_bp = Blueprint('battle', __name__)

# In-memory battle rooms for real-time tracking
active_rooms = {}   # battle_id -> {challenger_sid, opponent_sid, ...}
user_sid_map = {}   # user_id -> sid


def safe_object_id(id_str):
    if not id_str:
        return None
    try:
        return ObjectId(str(id_str))
    except (InvalidId, TypeError):
        return None


def get_or_create_stats(user_id):
    """Get or create BattleStats for a user"""
    stats = BattleStats.objects(user_id=safe_object_id(user_id)).first()
    if not stats:
        stats = BattleStats(user_id=safe_object_id(user_id))
        stats.save()
    return stats


def generate_battle_questions(topic):
    """Generate 10 rapid-fire MCQs for a battle topic via AI"""
    from ..services.ai_service import AIService
    ai = AIService()

    prompt = f"""Generate exactly 10 multiple-choice quiz questions about "{topic}" for a rapid-fire skill battle.

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "id": 1,
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }}
  ]
}}

Rules:
- "correct" is the 0-based index of the right answer
- Questions should range from easy to hard
- Keep questions concise (rapid-fire style)
- Cover different aspects of {topic}
- Exactly 4 options per question
- Exactly 10 questions"""

    content = ai.call_nvidia_api(prompt)
    if content:
        data = ai.parse_json_response(content)
        if data and 'questions' in data:
            questions = data['questions'][:10]
            # Ensure each question has required fields
            for i, q in enumerate(questions):
                q['id'] = i + 1
                if 'correct' not in q:
                    q['correct'] = 0
                if len(q.get('options', [])) != 4:
                    q['options'] = q.get('options', ['A', 'B', 'C', 'D'])[:4]
            return questions

    # Fallback: generate generic questions
    return generate_fallback_questions(topic)


def generate_fallback_questions(topic):
    """Fallback questions if AI fails"""
    templates = [
        {"question": f"Which of the following is a core concept in {topic}?",
         "options": ["Abstraction", "Recursion", "Polymorphism", "All of the above"], "correct": 3},
        {"question": f"What is the primary purpose of {topic}?",
         "options": ["Data storage", "Problem solving", "User interface", "Networking"], "correct": 1},
        {"question": f"Which tool is commonly used in {topic}?",
         "options": ["VS Code", "Photoshop", "Excel", "PowerPoint"], "correct": 0},
        {"question": f"What skill is most important for {topic}?",
         "options": ["Communication", "Logical thinking", "Drawing", "Singing"], "correct": 1},
        {"question": f"Which language is often associated with {topic}?",
         "options": ["Python", "Latin", "French", "Mandarin"], "correct": 0},
        {"question": f"What does debugging mean in {topic}?",
         "options": ["Adding features", "Finding and fixing errors", "Deleting code", "Writing docs"], "correct": 1},
        {"question": f"Which is a best practice in {topic}?",
         "options": ["Skip testing", "Write clean code", "Avoid comments", "Use one variable"], "correct": 1},
        {"question": f"What is version control used for in {topic}?",
         "options": ["Tracking changes", "Sending emails", "Designing UI", "Database queries"], "correct": 0},
        {"question": f"Which of these helps learn {topic} faster?",
         "options": ["Practice projects", "Memorizing syntax", "Watching only", "Copying code"], "correct": 0},
        {"question": f"What is an API in the context of {topic}?",
         "options": ["A programming interface", "A database", "A frontend", "A design tool"], "correct": 0},
    ]
    for i, q in enumerate(templates):
        q['id'] = i + 1
    return templates


def calculate_rating_change(winner_rating, loser_rating, is_draw=False):
    """ELO-like rating calculation"""
    k = 32
    expected = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))

    if is_draw:
        change = round(k * (0.5 - expected))
        return change, -change
    else:
        win_change = round(k * (1 - expected))
        loss_change = round(k * (0 - (1 - expected)))
        return max(win_change, 1), min(loss_change, -1)


def finalize_battle(battle, challenger_score, opponent_score):
    """Calculate winner, update ratings and badges"""
    battle.challenger_score = challenger_score
    battle.opponent_score = opponent_score
    battle.status = 'completed'
    battle.completed_at = datetime.utcnow()

    c_stats = get_or_create_stats(str(battle.challenger_id.id))
    c_stats.total_battles += 1

    new_badges_challenger = []
    new_badges_opponent = []

    if battle.is_ai_opponent:
        # Solo vs AI
        if challenger_score > opponent_score:
            battle.winner_id = battle.challenger_id
            c_stats.wins += 1
            c_stats.win_streak += 1
            if c_stats.win_streak > c_stats.best_streak:
                c_stats.best_streak = c_stats.win_streak
            c_stats.rating += 15
        elif challenger_score < opponent_score:
            c_stats.losses += 1
            c_stats.win_streak = 0
            c_stats.rating = max(c_stats.rating - 10, 100)
        else:
            battle.is_draw = True
            c_stats.draws += 1

        new_badges_challenger = c_stats.check_badges()
        c_stats.updated_at = datetime.utcnow()
        c_stats.save()
    else:
        # Real opponent
        o_stats = get_or_create_stats(str(battle.opponent_id.id))
        o_stats.total_battles += 1

        if challenger_score > opponent_score:
            battle.winner_id = battle.challenger_id
            win_delta, loss_delta = calculate_rating_change(c_stats.rating, o_stats.rating)
            c_stats.wins += 1
            c_stats.win_streak += 1
            if c_stats.win_streak > c_stats.best_streak:
                c_stats.best_streak = c_stats.win_streak
            c_stats.rating += win_delta
            o_stats.losses += 1
            o_stats.win_streak = 0
            o_stats.rating = max(o_stats.rating + loss_delta, 100)

        elif opponent_score > challenger_score:
            battle.winner_id = battle.opponent_id
            win_delta, loss_delta = calculate_rating_change(o_stats.rating, c_stats.rating)
            o_stats.wins += 1
            o_stats.win_streak += 1
            if o_stats.win_streak > o_stats.best_streak:
                o_stats.best_streak = o_stats.win_streak
            o_stats.rating += win_delta
            c_stats.losses += 1
            c_stats.win_streak = 0
            c_stats.rating = max(c_stats.rating + loss_delta, 100)

        else:
            battle.is_draw = True
            draw_delta_c, draw_delta_o = calculate_rating_change(c_stats.rating, o_stats.rating, is_draw=True)
            c_stats.draws += 1
            o_stats.draws += 1
            c_stats.rating += draw_delta_c
            o_stats.rating = max(o_stats.rating + draw_delta_o, 100)

        new_badges_challenger = c_stats.check_badges()
        new_badges_opponent = o_stats.check_badges()
        c_stats.updated_at = datetime.utcnow()
        o_stats.updated_at = datetime.utcnow()
        c_stats.save()
        o_stats.save()

    # Update user activity
    progress = UserProgress.objects(user_id=battle.challenger_id).first()
    if progress:
        result_text = 'Won' if battle.winner_id == battle.challenger_id else ('Draw' if battle.is_draw else 'Lost')
        progress.add_activity('battle', f'Battle {result_text}: {battle.topic} ({challenger_score}/{battle.total_questions})')

    battle.save()

    return {
        'battle': battle.to_dict(),
        'challenger_new_badges': new_badges_challenger,
        'opponent_new_badges': new_badges_opponent,
        'challenger_rating': c_stats.rating,
        'opponent_rating': get_or_create_stats(str(battle.opponent_id.id)).rating if not battle.is_ai_opponent else None
    }


# ============ REST Endpoints ============

@battle_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Global leaderboard sorted by rating"""
    top_stats = BattleStats.objects.order_by('-rating').limit(20)

    leaderboard = []
    for i, stats in enumerate(top_stats):
        user = User.objects(id=stats.user_id.id).first()
        if user:
            leaderboard.append({
                'rank': i + 1,
                'name': user.name,
                'user_id': str(user.id),
                'rating': stats.rating,
                'wins': stats.wins,
                'losses': stats.losses,
                'total_battles': stats.total_battles,
                'badges': stats.badges or [],
                'win_rate': round((stats.wins / stats.total_battles * 100), 1) if stats.total_battles > 0 else 0
            })

    return jsonify({'leaderboard': leaderboard}), 200


@battle_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_battle_stats():
    """Current user's battle stats"""
    user_id = get_jwt_identity()
    stats = get_or_create_stats(user_id)
    user = User.objects(id=safe_object_id(user_id)).first()

    data = stats.to_dict()
    data['name'] = user.name if user else 'Unknown'
    return jsonify({'stats': data}), 200


@battle_bp.route('/history', methods=['GET'])
@jwt_required()
def get_battle_history():
    """User's battle history"""
    user_id = get_jwt_identity()
    oid = safe_object_id(user_id)

    battles = BattleResult.objects(
        db.Q(challenger_id=oid) | db.Q(opponent_id=oid),
        status='completed'
    ).order_by('-created_at').limit(20)

    return jsonify({'battles': [b.to_dict() for b in battles]}), 200


@battle_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_battles():
    """List waiting battles that can be joined"""
    user_id = get_jwt_identity()
    oid = safe_object_id(user_id)

    waiting = BattleResult.objects(status='waiting', challenger_id__ne=oid).order_by('-created_at').limit(10)

    result = []
    for b in waiting:
        challenger = User.objects(id=b.challenger_id.id).first()
        c_stats = get_or_create_stats(str(b.challenger_id.id))
        result.append({
            'id': str(b.id),
            'topic': b.topic,
            'challenger': {'name': challenger.name if challenger else '?', 'rating': c_stats.rating},
            'created_at': b.created_at.isoformat()
        })

    return jsonify({'battles': result}), 200


# ============ Socket.IO Events ============

@socketio.on('connect')
def handle_connect():
    current_app.logger.info(f'Socket connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    current_app.logger.info(f'Socket disconnected: {sid}')

    # Find which user disconnected
    disc_user = None
    for uid, s in list(user_sid_map.items()):
        if s == sid:
            disc_user = uid
            del user_sid_map[uid]
            break

    # Notify opponent if mid-battle
    if disc_user:
        for battle_id, room in list(active_rooms.items()):
            if room.get('challenger_uid') == disc_user or room.get('opponent_uid') == disc_user:
                emit('opponent_disconnected', {'message': 'Opponent left the battle'}, room=battle_id)
                # Auto-complete the battle
                try:
                    battle = BattleResult.objects(id=safe_object_id(battle_id)).first()
                    if battle and battle.status == 'in_progress':
                        c_score = room.get('challenger_score', 0)
                        o_score = room.get('opponent_score', 0)
                        finalize_battle(battle, c_score, o_score)
                except Exception:
                    pass
                if battle_id in active_rooms:
                    del active_rooms[battle_id]
                break


@socketio.on('register_user')
def handle_register(data):
    """Map user_id to socket sid for real-time communication"""
    user_id = data.get('user_id')
    if user_id:
        user_sid_map[user_id] = request.sid
        current_app.logger.info(f'User {user_id} registered with sid {request.sid}')


@socketio.on('create_battle')
def handle_create_battle(data):
    """Create a new battle room and generate questions"""
    user_id = data.get('user_id')
    topic = data.get('topic', 'General Programming')

    if not user_id:
        emit('error', {'message': 'User ID required'})
        return

    sid = request.sid
    user_sid_map[user_id] = sid
    current_app.logger.info(f'Creating battle for user {user_id}, topic: {topic}')

    # Emit a "generating" status so the client knows we're working
    emit('battle_generating', {'message': 'Generating questions...', 'topic': topic})

    # Generate questions (this can take 10-20s for AI)
    questions = generate_battle_questions(topic)

    # Create battle record
    battle = BattleResult(
        challenger_id=safe_object_id(user_id),
        topic=topic,
        questions=questions,
        status='waiting',
        total_questions=len(questions)
    )
    battle.save()

    battle_id = str(battle.id)

    # Join the socket room (wrapped in try/except for stale SID)
    try:
        join_room(battle_id)
    except (ValueError, Exception) as e:
        current_app.logger.warning(f'join_room failed (client may have reconnected): {e}')
        # Client may have reconnected with a new SID
        new_sid = user_sid_map.get(user_id)
        if new_sid and new_sid != sid:
            sid = new_sid

    active_rooms[battle_id] = {
        'challenger_uid': user_id,
        'challenger_sid': sid,
        'opponent_uid': None,
        'opponent_sid': None,
        'challenger_score': 0,
        'opponent_score': 0,
        'challenger_answered': 0,
        'opponent_answered': 0,
        'questions': questions,
        'total': len(questions)
    }

    # Send safe questions (without correct answers) for display
    safe_questions = []
    for q in questions:
        safe_questions.append({
            'id': q['id'],
            'question': q['question'],
            'options': q['options']
        })

    emit('battle_created', {
        'battle_id': battle_id,
        'topic': topic,
        'questions': safe_questions,
        'total_questions': len(questions),
        'status': 'waiting'
    })

    # Broadcast to ALL users so their active battles list updates in real-time
    challenger_user = User.objects(id=safe_object_id(user_id)).first()
    socketio.emit('new_battle_available', {
        'id': battle_id,
        'topic': topic,
        'challenger': {
            'name': challenger_user.name if challenger_user else 'Unknown',
            'id': user_id
        }
    }, namespace='/')


@socketio.on('join_battle')
def handle_join_battle(data):
    """Join an existing waiting battle"""
    user_id = data.get('user_id')
    battle_id = data.get('battle_id')

    if not user_id or not battle_id:
        emit('error', {'message': 'user_id and battle_id required'})
        return

    user_sid_map[user_id] = request.sid

    battle = BattleResult.objects(id=safe_object_id(battle_id)).first()
    if not battle or battle.status != 'waiting':
        emit('error', {'message': 'Battle not found or already started'})
        return

    if str(battle.challenger_id.id) == user_id:
        emit('error', {'message': 'Cannot join your own battle'})
        return

    # Update battle record
    battle.opponent_id = safe_object_id(user_id)
    battle.status = 'in_progress'
    battle.save()

    # Join room
    join_room(battle_id)

    # Update active room
    if battle_id in active_rooms:
        active_rooms[battle_id]['opponent_uid'] = user_id
        active_rooms[battle_id]['opponent_sid'] = request.sid
    else:
        active_rooms[battle_id] = {
            'challenger_uid': str(battle.challenger_id.id),
            'opponent_uid': user_id,
            'opponent_sid': request.sid,
            'challenger_score': 0,
            'opponent_score': 0,
            'challenger_answered': 0,
            'opponent_answered': 0,
            'questions': battle.questions,
            'total': battle.total_questions
        }

    # Safe questions
    safe_questions = [{'id': q['id'], 'question': q['question'], 'options': q['options']} for q in battle.questions]

    # Get user names
    challenger = User.objects(id=battle.challenger_id.id).first()
    opponent = User.objects(id=safe_object_id(user_id)).first()

    challenger_uid = str(battle.challenger_id.id)

    # Get the CURRENT SID for the challenger (may have reconnected)
    challenger_sid = user_sid_map.get(challenger_uid)
    opponent_sid = request.sid

    # Update the active room with current SIDs
    if battle_id in active_rooms:
        active_rooms[battle_id]['challenger_sid'] = challenger_sid
        active_rooms[battle_id]['opponent_sid'] = opponent_sid

    current_app.logger.info(f'Battle {battle_id}: challenger_sid={challenger_sid}, opponent_sid={opponent_sid}')

    # Notify challenger directly via their current SID
    if challenger_sid:
        socketio.emit('battle_start', {
            'battle_id': battle_id,
            'topic': battle.topic,
            'questions': safe_questions,
            'total_questions': battle.total_questions,
            'opponent': {'name': opponent.name if opponent else '?'},
            'role': 'challenger'
        }, to=challenger_sid, namespace='/')

    # Notify opponent (the joiner)
    emit('battle_start', {
        'battle_id': battle_id,
        'topic': battle.topic,
        'questions': safe_questions,
        'total_questions': battle.total_questions,
        'opponent': {'name': challenger.name if challenger else '?'},
        'role': 'opponent'
    })


@socketio.on('start_solo')
def handle_start_solo(data):
    """Start playing solo (AI opponent) if no one joins"""
    battle_id = data.get('battle_id')
    user_id = data.get('user_id')

    if not battle_id:
        return

    battle = BattleResult.objects(id=safe_object_id(battle_id)).first()
    if not battle or battle.status != 'waiting':
        return

    battle.is_ai_opponent = True
    battle.status = 'in_progress'
    battle.save()

    if battle_id in active_rooms:
        active_rooms[battle_id]['is_solo'] = True

    safe_questions = [{'id': q['id'], 'question': q['question'], 'options': q['options']} for q in battle.questions]

    emit('battle_start', {
        'battle_id': battle_id,
        'topic': battle.topic,
        'questions': safe_questions,
        'total_questions': battle.total_questions,
        'opponent': {'name': 'AI Opponent'},
        'role': 'challenger',
        'is_solo': True
    })


@socketio.on('submit_answer')
def handle_submit_answer(data):
    """Handle a player's answer submission"""
    battle_id = data.get('battle_id')
    user_id = data.get('user_id')
    question_id = data.get('question_id')
    answer_idx = data.get('answer')

    if not battle_id or battle_id not in active_rooms:
        return

    room = active_rooms[battle_id]
    questions = room['questions']

    # Find the question
    question = None
    for q in questions:
        if q['id'] == question_id:
            question = q
            break

    if not question:
        return

    is_correct = (answer_idx == question['correct'])

    # Determine if challenger or opponent
    is_challenger = (room.get('challenger_uid') == user_id)

    if is_challenger:
        room['challenger_answered'] += 1
        if is_correct:
            room['challenger_score'] += 1
    else:
        room['opponent_answered'] += 1
        if is_correct:
            room['opponent_score'] += 1

    # Send result to the answering player
    emit('answer_result', {
        'question_id': question_id,
        'is_correct': is_correct,
        'correct_answer': question['correct'],
        'your_score': room['challenger_score'] if is_challenger else room['opponent_score']
    })

    # Send progress to opponent using their current SID
    opponent_uid = room.get('opponent_uid') if is_challenger else room.get('challenger_uid')
    opponent_sid = user_sid_map.get(opponent_uid) if opponent_uid else None
    if opponent_sid:
        socketio.emit('opponent_progress', {
            'opponent_score': room['challenger_score'] if is_challenger else room['opponent_score'],
            'opponent_answered': room['challenger_answered'] if is_challenger else room['opponent_answered']
        }, to=opponent_sid, namespace='/')

    # Check if battle is complete
    total = room['total']
    is_solo = room.get('is_solo', False)

    if is_solo:
        if room['challenger_answered'] >= total:
            # Generate AI score (40-80% correct)
            ai_score = random.randint(int(total * 0.4), int(total * 0.8))
            room['opponent_score'] = ai_score

            battle = BattleResult.objects(id=safe_object_id(battle_id)).first()
            if battle:
                result = finalize_battle(battle, room['challenger_score'], ai_score)
                # Emit to challenger directly
                emit('battle_result', result)
                if battle_id in active_rooms:
                    del active_rooms[battle_id]
    else:
        if room['challenger_answered'] >= total and room['opponent_answered'] >= total:
            battle = BattleResult.objects(id=safe_object_id(battle_id)).first()
            if battle:
                result = finalize_battle(battle, room['challenger_score'], room['opponent_score'])
                # Emit to both players directly
                c_sid = user_sid_map.get(room.get('challenger_uid'))
                o_sid = user_sid_map.get(room.get('opponent_uid'))
                if c_sid:
                    socketio.emit('battle_result', result, to=c_sid, namespace='/')
                if o_sid:
                    socketio.emit('battle_result', result, to=o_sid, namespace='/')
                if battle_id in active_rooms:
                    del active_rooms[battle_id]
