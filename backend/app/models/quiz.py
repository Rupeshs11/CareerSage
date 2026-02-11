"""
Quiz Models
"""
from datetime import datetime
from ..extensions import db


class QuizResult(db.Document):
    """User's skill quiz result"""
    meta = {'collection': 'quiz_results'}
    
    user_id = db.ReferenceField('User', required=True)
    
    # Quiz metadata
    category = db.StringField(required=True, default='general')
    quiz_type = db.StringField(required=True, default='skill_assessment')
    
    # Results
    answers = db.ListField(db.DictField(), default=list)  # [{question_id, answer, is_correct}]
    score = db.IntField(default=0)
    total_questions = db.IntField(default=0)
    percentage = db.FloatField(default=0.0)
    
    # Skill analysis
    strong_skills = db.ListField(db.StringField(), default=list)
    weak_skills = db.ListField(db.StringField(), default=list)
    skill_gaps = db.ListField(db.StringField(), default=list)
    
    # Recommendations
    recommendations = db.ListField(db.StringField(), default=list)
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.utcnow)
    time_taken_seconds = db.IntField()
    
    def calculate_percentage(self):
        """Calculate score percentage"""
        if self.total_questions > 0:
            self.percentage = round((self.score / self.total_questions) * 100, 1)
        return self.percentage
    
    def to_dict(self):
        """Serialize quiz result to dictionary"""
        return {
            'id': str(self.id),
            'category': self.category,
            'quiz_type': self.quiz_type,
            'score': self.score,
            'total_questions': self.total_questions,
            'percentage': self.percentage,
            'strong_skills': self.strong_skills or [],
            'weak_skills': self.weak_skills or [],
            'skill_gaps': self.skill_gaps or [],
            'recommendations': self.recommendations or [],
            'time_taken_seconds': self.time_taken_seconds,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<QuizResult {self.category} - {self.percentage}%>'
