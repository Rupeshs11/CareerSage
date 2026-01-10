"""
Quiz Models
"""
from datetime import datetime
from ..extensions import db


class QuizResult(db.Model):
    """User's skill quiz result"""
    __tablename__ = 'quiz_results'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Quiz metadata
    category = db.Column(db.String(50), nullable=False, default='general')
    quiz_type = db.Column(db.String(50), nullable=False, default='skill_assessment')
    
    # Results
    answers = db.Column(db.JSON, default=list)  # [{question_id, answer, is_correct}]
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0.0)
    
    # Skill analysis
    strong_skills = db.Column(db.JSON, default=list)
    weak_skills = db.Column(db.JSON, default=list)
    skill_gaps = db.Column(db.JSON, default=list)
    
    # Recommendations
    recommendations = db.Column(db.JSON, default=list)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    
    def calculate_percentage(self):
        """Calculate score percentage"""
        if self.total_questions > 0:
            self.percentage = round((self.score / self.total_questions) * 100, 1)
        return self.percentage
    
    def to_dict(self):
        """Serialize quiz result to dictionary"""
        return {
            'id': self.id,
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
