"""
Battle Models - 1v1 Skill Battle System
"""
from datetime import datetime
from ..extensions import db


class BattleResult(db.Document):
    """Stores each 1v1 battle"""
    meta = {'collection': 'battle_results'}
    
    challenger_id = db.ReferenceField('User', required=True)
    opponent_id = db.ReferenceField('User')
    
    topic = db.StringField(required=True)
    
    challenger_score = db.IntField(default=0)
    opponent_score = db.IntField(default=0)
    total_questions = db.IntField(default=10)
    
    winner_id = db.ReferenceField('User')
    is_draw = db.BooleanField(default=False)
    
    # waiting / in_progress / completed
    status = db.StringField(default='waiting')
    
    questions = db.ListField(db.DictField(), default=list)
    
    # Track which answers each player gave
    challenger_answers = db.ListField(db.DictField(), default=list)
    opponent_answers = db.ListField(db.DictField(), default=list)
    
    is_ai_opponent = db.BooleanField(default=False)
    
    created_at = db.DateTimeField(default=datetime.utcnow)
    completed_at = db.DateTimeField()
    
    def to_dict(self):
        from ..models.user import User
        challenger = User.objects(id=self.challenger_id.id).first() if self.challenger_id else None
        opponent = User.objects(id=self.opponent_id.id).first() if self.opponent_id else None
        
        return {
            'id': str(self.id),
            'challenger': {'id': str(self.challenger_id.id), 'name': challenger.name} if challenger else None,
            'opponent': {'id': str(self.opponent_id.id), 'name': opponent.name} if opponent else {'name': 'AI Opponent'},
            'topic': self.topic,
            'challenger_score': self.challenger_score,
            'opponent_score': self.opponent_score,
            'total_questions': self.total_questions,
            'winner_id': str(self.winner_id.id) if self.winner_id else None,
            'is_draw': self.is_draw,
            'status': self.status,
            'is_ai_opponent': self.is_ai_opponent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class BattleStats(db.Document):
    """Per-user battle statistics and badges"""
    meta = {'collection': 'battle_stats'}
    
    user_id = db.ReferenceField('User', required=True, unique=True)
    
    total_battles = db.IntField(default=0)
    wins = db.IntField(default=0)
    losses = db.IntField(default=0)
    draws = db.IntField(default=0)
    
    rating = db.IntField(default=1000)
    badges = db.ListField(db.StringField(), default=list)
    
    win_streak = db.IntField(default=0)
    best_streak = db.IntField(default=0)
    
    updated_at = db.DateTimeField(default=datetime.utcnow)
    
    def check_badges(self):
        """Award badges based on current stats"""
        badge_rules = [
            ('First Blood', self.wins >= 1),
            ('Warrior', self.wins >= 10),
            ('Champion', self.wins >= 25),
            ('On Fire', self.best_streak >= 5),
            ('Diamond', self.rating >= 1500),
            ('Legend', self.rating >= 2000),
        ]
        
        new_badges = []
        for badge_name, condition in badge_rules:
            if condition and badge_name not in (self.badges or []):
                self.badges = (self.badges or []) + [badge_name]
                new_badges.append(badge_name)
        
        return new_badges
    
    def to_dict(self):
        return {
            'total_battles': self.total_battles,
            'wins': self.wins,
            'losses': self.losses,
            'draws': self.draws,
            'rating': self.rating,
            'badges': self.badges or [],
            'win_streak': self.win_streak,
            'best_streak': self.best_streak,
            'win_rate': round((self.wins / self.total_battles * 100), 1) if self.total_battles > 0 else 0
        }
